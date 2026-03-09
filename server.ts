import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

let db: Database.Database;

try {
  db = new Database("workflow.db");
} catch (error) {
  console.error("Failed to open database, recreating...", error);
  if (fs.existsSync("workflow.db")) {
    fs.unlinkSync("workflow.db");
  }
  db = new Database("workflow.db");
}

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

// Add is_ai_generated column if it doesn't exist
try {
  db.exec(`ALTER TABLE workflows ADD COLUMN is_ai_generated INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists
}

// Add agreement_id column if it doesn't exist
try {
  db.exec(`ALTER TABLE workflows ADD COLUMN agreement_id TEXT`);
} catch (e) {
  // Column already exists
}

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
    const { name, is_ai_generated, agreement_id } = req.body;
    db.prepare("INSERT INTO workflows (id, name, is_ai_generated, agreement_id) VALUES (?, ?, ?, ?)").run(id, name || "Untitled Workflow", is_ai_generated ? 1 : 0, agreement_id || null);
    res.json({ id, name, is_ai_generated: is_ai_generated ? 1 : 0, agreement_id });
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
    const { nodes, edges, name, is_ai_generated, agreement_id } = req.body;

    const transaction = db.transaction(() => {
      if (name !== undefined) {
        db.prepare("UPDATE workflows SET name = ? WHERE id = ?").run(name, id);
      }
      if (is_ai_generated !== undefined) {
        db.prepare("UPDATE workflows SET is_ai_generated = ? WHERE id = ?").run(is_ai_generated ? 1 : 0, id);
      }
      if (agreement_id !== undefined) {
        db.prepare("UPDATE workflows SET agreement_id = ? WHERE id = ?").run(agreement_id, id);
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

  app.get("/api/analytics/asset-usage", (req, res) => {
    try {
      const allNodes = db.prepare(`
        SELECT 
          n.id as nodeId,
          n.workflow_id as workflowId,
          w.name as workflowName,
          n.data as nodeData
        FROM nodes n
        JOIN workflows w ON n.workflow_id = w.id
      `).all();

      const usage = allNodes.flatMap((n: any) => {
        const data = JSON.parse(n.nodeData);
        const assets = data.assets || [];
        return assets.map((asset: any) => ({
          assetId: asset.id,
          assetName: asset.name,
          assetType: asset.type,
          assetRole: asset.roleOrDetails,
          workflowId: n.workflowId,
          workflowName: n.workflowName,
          nodeId: n.nodeId,
          nodeTitle: data.title,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime
        }));
      });

      res.json(usage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch asset usage" });
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
