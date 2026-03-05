import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

const db = new Database("workflow.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    type TEXT NOT NULL,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    source_handle TEXT,
    target_handle TEXT,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/workflows", (req, res) => {
    const workflows = db.prepare("SELECT * FROM workflows ORDER BY created_at DESC").all();
    res.json(workflows);
  });

  app.post("/api/workflows", (req, res) => {
    const id = uuidv4();
    const { name } = req.body;
    db.prepare("INSERT INTO workflows (id, name) VALUES (?, ?)").run(id, name || "Untitled Workflow");
    res.json({ id, name });
  });

  app.get("/api/workflows/:id", (req, res) => {
    const { id } = req.params;
    const workflow = db.prepare("SELECT * FROM workflows WHERE id = ?").get(id);
    if (!workflow) return res.status(404).json({ error: "Not found" });

    const nodes = db.prepare("SELECT * FROM nodes WHERE workflow_id = ?").all(id).map((n: any) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position_x, y: n.position_y },
      data: JSON.parse(n.data),
    }));

    const edges = db.prepare("SELECT * FROM edges WHERE workflow_id = ?").all(id).map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.source_handle,
      targetHandle: e.target_handle,
    }));

    res.json({ ...workflow, nodes, edges });
  });

  app.put("/api/workflows/:id", (req, res) => {
    const { id } = req.params;
    const { nodes, edges, name } = req.body;

    const transaction = db.transaction(() => {
      if (name) {
        db.prepare("UPDATE workflows SET name = ? WHERE id = ?").run(name, id);
      }
      
      if (nodes && edges) {
        // Delete existing nodes and edges for this workflow
        db.prepare("DELETE FROM nodes WHERE workflow_id = ?").run(id);
        db.prepare("DELETE FROM edges WHERE workflow_id = ?").run(id);

        // Insert new nodes
        const insertNode = db.prepare("INSERT INTO nodes (id, workflow_id, type, position_x, position_y, data) VALUES (?, ?, ?, ?, ?, ?)");
        for (const node of nodes) {
          insertNode.run(node.id, id, node.type, node.position.x, node.position.y, JSON.stringify(node.data));
        }

        // Insert new edges
        const insertEdge = db.prepare("INSERT INTO edges (id, workflow_id, source, target, source_handle, target_handle) VALUES (?, ?, ?, ?, ?, ?)");
        for (const edge of edges) {
          insertEdge.run(edge.id, id, edge.source, edge.target, edge.sourceHandle || null, edge.targetHandle || null);
        }
      }
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save workflow" });
    }
  });

  app.delete("/api/workflows/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM workflows WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete workflow" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
