export default function HealthTips() {
  const tips = [
    {
      icon: "💧",
      title: "Drink Safe Water",
      english:
        "Drink at least 6-8 glasses of clean water every day. If water is not clean, boil it or use filtered water to avoid stomach infections.",
      telugu: "రోజుకి 6-8 గ్లాసుల శుభ్రమైన నీళ్లు తాగండి. నీళ్లు శుభ్రంగా లేకపోతే మరిగించండి లేదా ఫిల్టర్ చేయండి."
    },
    {
      icon: "🍚",
      title: "Eat Balanced Meals",
      english: "Eat local, seasonal food — rice/ragi, dal, vegetables and fruits. Reduce fried food, salt and sugar. Do not skip meals.",
      telugu: "అన్నం, రాగులు, పప్పు, కూరగా ఉండే ఆహారం తినండి. ఎక్కువ వేపుడు, ఉప్పు, చక్కెర మానండి. భోజనం దాటవేయకండి."
    },
    {
      icon: "🦟",
      title: "Fight Mosquitoes",
      english: "Sleep under a mosquito net, clear stagnant water around your home, and cover water containers. This prevents malaria and dengue.",
      telugu: "దోమతెర కింద పరుకోండి, ఇంటి చుట్టూ నిలిచిన నీరు తుడచేయండి. దీనివల్ల మలేరియా, డెంగ్యూ కాదు."
    },
    {
      icon: "🧼",
      title: "Wash Hands",
      english: "Wash hands with soap before eating, after using the toilet, and after changing a baby. This stops many infections.",
      telugu: "భోజనానికి ముందు, టాయిలెట్ తర్వాత, శిశువు బట్టలు మార్చిన తర్వాత సబ్బుతో చేతులు కడుగుకోండి. చాలా వ్యాధులు మానుతాయి."
    },
    {
      icon: "💊",
      title: "Take Medicine Properly",
      english: "Take medicines only from a doctor or health worker. Take them at the correct time and finish the full course. Never share medicine.",
      telugu: "డాక్టర్ లేదా హెల్త్ వర్కర్ చెప్పిన మందే తీసుకోండి. సమయానికి తీసుకోండి, మందు పూర్తి చేయండి. మందులను పంచుకోకూడదు."
    },
    {
      icon: "🚴",
      title: "Stay Active",
      english: "Walk or do light exercise for 30 minutes daily. Physical activity helps keep blood pressure, sugar and weight under control.",
      telugu: "రోజూ 30 నిముషాలు నడక చేయండి లేదా తేలికపాటి వ్యుకు చేయండి. BP, చక్కెర, బరువుని అదుపులో ఉంచుతుంది."
    },
    {
      icon: "🤱",
      title: "Breastfeed Babies",
      english: "Breastfeed babies for at least the first 6 months. It gives the baby strong immunity against disease.",
      telugu: "శిశువుకు కనీసం మొదట 6 నెలలు తల్లి పాలు ఇవ్వండి. ఇది శిశువు రోగ నిరోధక శక్తిని పెంచుతుంది."
    },
    {
      icon: "🚭",
      title: "Avoid Smoking & Chewing Tobacco",
      english: "Smoking and tobacco harm your lungs, mouth and heart. Quitting protects your entire family.",
      telugu: "ధూమపానం మరియు పోకలు మీ ఊపిరితిత్తులను, నోటికి, గుండెకు హాని చేస్తాయి. వాటి నిలిపివేసుకోండి."
    }
  ];

  return (
    <div className="page-container">
      <h2>💡 Health Tips & Prevention</h2>
      <p className="muted">
        Simple, low-cost everyday habits for rural families (English & తెలుగు).
      </p>

      <div className="tips-grid">
        {tips.map((tip, idx) => (
          <div key={idx} className="tip-card">
            <div className="tip-icon">{tip.icon}</div>
            <h3>{tip.title}</h3>
            <p>{tip.english}</p>
            <p className="tip-telugu">{tip.telugu}</p>
          </div>
        ))}
      </div>

      <div className="tips-footer">
        <p className="muted small-text">
          ⚠️ These are general wellness tips only and are not a substitute for professional
          medical care. Please contact your PHC or doctor for personal guidance.
        </p>
      </div>
    </div>
  );
}