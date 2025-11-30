// src/services/AIService.ts

// Yapay Zeka için "Unutulan Görevler" Havuzu
const SUGGESTIONS = [
  // Sağlık
  { title: "Bir bardak su iç 💧", category: "Personal" },
  { title: "Duruşunu düzelt, dik otur 🪑", category: "Personal" },
  { title: "Gözlerini 2 dakika dinlendir 👀", category: "Personal" },
  { title: "Odayı havalandır 🌬️", category: "Personal" },
  { title: "Vitaminlerini aldın mı? 💊", category: "Personal" },
  
  // Sosyal & Aile
  { title: "Annene/Babana hal hatır sor 📞", category: "Personal" },
  { title: "Eski bir arkadaşına mesaj at 👋", category: "Personal" },
  { title: "Çiçekleri sula 🪴", category: "Personal" },
  
  // İş & Düzen
  { title: "Mail kutunu temizle 📧", category: "Work" },
  { title: "Yarınki kıyafetlerini hazırla 👔", category: "Personal" },
  { title: "Cüzdanını/Çantanı düzenle 🎒", category: "Personal" },
  { title: "Bilgisayar masaüstünü temizle 💻", category: "Work" },
  { title: "Fatura ödemelerini kontrol et 💸", category: "Shopping" },
  
  // Alışveriş
  { title: "Diş macunu bitmek üzere mi? 🪥", category: "Shopping" },
  { title: "Buzdolabındaki eksikleri not al 📝", category: "Shopping" },
];

export const AIService = {
  // Yapay zeka düşünüyormuş gibi gecikmeli cevap verir
  suggestTask: async (): Promise<{title: string, category: any}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * SUGGESTIONS.length);
        resolve(SUGGESTIONS[randomIndex]);
      }, 800); // 0.8 saniye "Düşünüyor..." efekti
    });
  }
};