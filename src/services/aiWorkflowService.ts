import { GoogleGenAI, Type } from "@google/genai";

// Define the expected JSON schema for the workflow
const workflowSchema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the node (e.g., '1', '2')" },
          type: { type: Type.STRING, description: "Type of the node. Must be 'custom'" },
          data: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "The title or name of the task" },
              type: { type: Type.STRING, description: "The category of the task (e.g., 'meeting', 'shooting', 'editing', 'delivery', 'payment')" },
              date: { type: Type.STRING, description: "Estimated date or timeframe (e.g., 'Tarih Belirsiz', 'Düğünden 1 Ay Önce')" },
              assignee: { type: Type.STRING, description: "Role or person responsible (e.g., 'Fotoğrafçı', 'Editör', 'Müşteri İlişkileri')" },
              status: { type: Type.STRING, description: "Initial status. Must be 'pending'" },
              assets: {
                type: Type.ARRAY,
                description: "List of assets required for this task",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, description: "Must be 'personnel', 'equipment', 'location', or 'vehicle'" },
                    name: { type: Type.STRING },
                    roleOrDetails: { type: Type.STRING }
                  },
                  required: ["id", "type", "name"]
                }
              }
            },
            required: ["label", "type", "date", "assignee", "status"]
          },
          position: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: "X coordinate on the canvas" },
              y: { type: Type.NUMBER, description: "Y coordinate on the canvas" }
            },
            required: ["x", "y"]
          }
        },
        required: ["id", "type", "data", "position"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the edge (e.g., 'e1-2')" },
          source: { type: Type.STRING, description: "ID of the source node" },
          target: { type: Type.STRING, description: "ID of the target node" },
          type: { type: Type.STRING, description: "Type of the edge. Must be 'custom'" }
        },
        required: ["id", "source", "target", "type"]
      }
    }
  },
  required: ["nodes", "edges"]
};

export async function generateWorkflowFromPrompt(prompt: string, agreementData?: any) {
  try {
    const apiKey = localStorage.getItem('gemini_api_key');

    if (!apiKey) {
      throw new Error("API Anahtarı bulunamadı. Lütfen sağ alt köşedeki Ayarlar ikonuna tıklayarak Gemini API anahtarınızı girin.");
    }

    const ai = new GoogleGenAI({ apiKey });

    let agreementContext = '';
    if (agreementData) {
      agreementContext = `
      Müşteri ve Anlaşma Bilgileri:
      - Müşteri Adı: ${agreementData.accountName}
      - Etkinlik: ${agreementData.eventCategoryName}
      - Tarih: ${agreementData.eventStartDate} - ${agreementData.eventEndDate}
      - Mekan: ${agreementData.venueName} - ${agreementData.hallName}
      - Detaylar: ${agreementData.terms}
      
      Lütfen iş akışını bu bilgilere göre özelleştir. Çekim adımlarına mekan bilgisini lokasyon asset'i olarak ekle.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sen bir fotoğraf stüdyosu CRM sistemi (StudioMan) için iş akışı (workflow) mimarısın. 
      Sana verilen anlaşma bilgilerine bakarak bu etkinlik için baştan sona tüm operasyonel adımları içeren mantıklı bir iş akışı oluşturacaksın.
      
      Kurallar:
      1. Adımlar kronolojik ve mantıklı bir sırayla birbirine bağlanmalıdır (Edges).
      2. Düğüm tipleri (data.type) şunlardan biri olmalıdır: 'meeting', 'shooting', 'editing', 'delivery', 'payment', 'other'.
      3. Düğümlerin (Nodes) X ve Y koordinatlarını, ekranda güzel görünecek şekilde (örneğin soldan sağa veya yukarıdan aşağıya doğru artan değerlerle) ayarla. Her düğüm arası yaklaşık 250px X veya 150px Y boşluk bırak.
      4. İlk düğüm genellikle 'Müşteri Görüşmesi' veya 'Sözleşme/Kapora' olmalıdır.
      5. Son düğüm genellikle 'Teslimat' veya 'Kalan Ödeme' olmalıdır.
      6. ÇOK ÖNEMLİ: Her bir operasyonel adıma (özellikle çekim ve montaj adımlarına) o işi yapacak uygun "ekip elemanlarını" (personnel) asset olarak mutlaka ata (Örn: Baş Fotoğrafçı, Asistan, Kameraman, Kurgucu).
      7. ÇOK ÖNEMLİ: Çekim adımlarına kullanılacak "ekipmanları" (equipment) asset olarak mutlaka ata. Eğer "Detaylar" kısmında farklı saatlerde/mekanlarda farklı çekimler varsa (Örn: 12:00 Kuaför, 18:00 Düğün), bunları AYRI düğümler (nodes) olarak oluştur ve her mekanın fiziksel şartlarına uygun farklı ekipmanlar ata (Örn: Kuaför gibi dar alanlar için tepe flaşı/portre lensi, dış çekim veya salon için drone/gimbal/paraflaş).
      8. Çekim adımlarına "mekan" (location) bilgisini asset olarak ekle.
      
      ${agreementContext}
      
      Kullanıcı Talebi (Eğer varsa dikkate al, yoksa anlaşma detaylarına göre standart bir akış oluştur): "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: workflowSchema,
        temperature: 0.7,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error generating workflow:", error);
    throw error;
  }
}
