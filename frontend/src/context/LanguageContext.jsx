import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navServices: 'Services',
    navCeremonies: 'Ceremonies',
    navGallery: 'Gallery',
    navContact: 'Contact',
    navBooking: 'Book Now',
    heroTitle: 'Seamless Gatherings, Purposeful Celebrations',
    heroSubtitle: 'South India’s premier event curators blending rich Vedic traditions with flawless modern corporate execution.',
    whyChooseUs: 'Why GS Associates?',
    stressReduction: 'Stress Reduction',
    stressReductionDesc: 'We handle end-to-end planning so you don’t have to worry about a single detail.',
    costControl: 'Cost Control',
    costControlDesc: 'Transparent packages with no hidden costs and absolute budget compliance.',
    brandRep: 'Enhanced Reputation',
    brandRepDesc: 'Polished, professional execution that enhances your corporate brand.',
    riskMitigation: 'Risk Mitigation',
    riskMitigationDesc: 'Insured vendors, backup contingencies, and thorough regulatory compliance.',
    guestExp: 'Superior Guest Experiences',
    guestExpDesc: 'Every detail designed around keeping your attendees fully engaged and wowed.'
  },
  ta: { // Tamil
    navHome: 'முகப்பு',
    navAbout: 'எங்களை பற்றி',
    navServices: 'சேவைகள்',
    navCeremonies: 'சடங்குகள்',
    navGallery: 'புகைப்படங்கள்',
    navContact: 'தொடர்பு',
    navBooking: 'பதிவு செய்ய',
    heroTitle: 'தடையற்ற நிகழ்வுகள், நோக்கமுள்ள கொண்டாட்டங்கள்',
    heroSubtitle: 'பாரம்பரிய சடங்குகள் மற்றும் நவீன கார்ப்பரேட் நிகழ்வுகளை மிகச்சிறப்பாக ஒருங்கிணைக்கும் தென்னிந்தியாவின் முதன்மை நிகழ்வு மேலாளர்கள்.',
    whyChooseUs: 'ஏன் ஜி.எஸ் அசோசியேட்ஸ்?',
    stressReduction: 'மன அழுத்தம் குறைப்பு',
    stressReductionDesc: 'தொடக்கத்திலிருந்து இறுதி வரை அனைத்து திட்டமிடல்களையும் நாங்களே கையாள்வதால் நீங்கள் கவலைப்பட தேவையில்லை.',
    costControl: 'செலவு கட்டுப்பாடு',
    costControlDesc: 'மறைமுக கட்டணங்கள் இல்லாத வெளிப்படையான தொகுப்புகள் மற்றும் பட்ஜெட் இணக்கம்.',
    brandRep: 'பிராண்ட் நற்பெயர்',
    brandRepDesc: 'உங்கள் நிறுவனத்தின் நற்பெயரை மேம்படுத்தும் நேர்த்தியான, தொழில்முறை நிர்வாகம்.',
    riskMitigation: 'அபாயக் குறைப்பு',
    riskMitigationDesc: 'காப்பீடு செய்யப்பட்ட விற்பனையாளர்கள் மற்றும் அவசரகால திட்டமிடல்கள்.',
    guestExp: 'சிறந்த விருந்தினர் அனுபவம்',
    guestExpDesc: 'விருந்தினர்கள் மகிழ்ச்சியாகவும் ஈடுபாடாகவும் இருக்க வடிவமைக்கப்பட்ட ஒவ்வொரு விவரமும்.'
  },
  te: { // Telugu
    navHome: 'హోమ్',
    navAbout: 'మా గురించి',
    navServices: 'సేవలు',
    navCeremonies: 'సాంప్రదాయాలు',
    navGallery: 'గ్యాలరీ',
    navContact: 'సంప్రదించండి',
    navBooking: 'బుకింగ్',
    heroTitle: 'అద్భుతమైన వేడుకలు, అపూర్వ అనుభూతులు',
    heroSubtitle: 'దక్షిణ భారతదేశపు ప్రముఖ ఈవెంట్ నిర్వాహకులు. సంప్రదాయాలు మరియు ఆధునిక కార్పొరేట్ వేడుకల అద్భుత కలయిక.',
    whyChooseUs: 'ఎందుకు జి.ఎస్ అసోసియేట్స్?',
    stressReduction: 'ఒత్తిడి ఉపశమనం',
    stressReductionDesc: 'మేము మొత్తం ప్రణాళికను చూసుకుంటాము, కాబట్టి మీరు ఏ విషయానికీ ఆందోళన చెందాల్సిన అవసరం లేదు.',
    costControl: 'బడ్జెట్ నియంత్రణ',
    costControlDesc: 'పారదర్శక ప్యాకేజీలు, దాచిన ఖర్చులు లేవు మరియు ఖచ్చితమైన బడ్జెట్ నిర్వహణ.',
    brandRep: 'సంస్థ నற்பేరు',
    brandRepDesc: 'మీ కార్పొరేట్ బ్రాండ్ ప్రతిష్టను పెంచే ప్రొఫెషనల్ నిర్వహణ.',
    riskMitigation: 'రిస్క్ మేనేజ్‌మెంట్',
    riskMitigationDesc: 'భద్రతా ప్రమాణాలు, బీమా పొందిన వెండర్లు మరియు ప్రత్యామ్నాయ ప్రణాళికలు.',
    guestExp: 'అద్భుతమైన అతిథి మర్యాదలు',
    guestExpDesc: 'అతిథులకు చిరస్మరణీయ అనుభూతిని అందించేలా ప్రతి చిన్న విషయాన్ని ప్లాన్ చేస్తాము.'
  },
  kn: { // Kannada
    navHome: 'ಮುಖಪುಟ',
    navAbout: 'ನಮ್ಮ ಬಗ್ಗೆ',
    navServices: 'ಸೇವೆಗಳು',
    navCeremonies: 'ಧಾರ್ಮಿಕ ವಿಧಿಗಳು',
    navGallery: 'ಗ್ಯಾಲರಿ',
    navContact: 'ಸಂಪರ್ಕಿಸಿ',
    navBooking: 'ಬುಕಿಂಗ್ ಮಾಡಿ',
    heroTitle: 'ಅದ್ಭುತ ಆಚರಣೆಗಳು, ಅವಿಸ್ಮರಣೀಯ ಕ್ಷಣಗಳು',
    heroSubtitle: 'ದಕ್ಷಿಣ ಭಾರತದ ಪ್ರಮುಖ ಕಾರ್ಯಕ್ರಮ ಸಂಘಟಕರು. ಸಂಪ್ರದಾಯ ಮತ್ತು ಆಧುನಿಕ ಶೈಲಿಯ ಭವ್ಯ ಸಂಗಮ.',
    whyChooseUs: 'ಏಕೆ ಜಿ.ಎಸ್ ಅಸೋಸಿಯೇಟ್ಸ್?',
    stressReduction: 'ಒತ್ತಡ ಮುಕ್ತ',
    stressReductionDesc: 'ಕಾರ್ಯಕ್ರಮದ ಆರಂಭದಿಂದ ಅಂತ್ಯದವರೆಗಿನ ಎಲ್ಲಾ ಜವಾಬ್ದಾರಿಗಳನ್ನು ನಾವೇ ನಿಭಾಯಿಸುತ್ತೇವೆ.',
    costControl: 'ವೆಚ್ಚ ನಿಯಂತ್ರಣ',
    costControlDesc: 'ಪಾರದರ್ಶಕ ದರಗಳು, ಯಾವುದೇ ಗುಪ್ತ ಶುಲ್ಕಗಳಿಲ್ಲದೆ ಬಜೆಟ್ ಸ್ನೇಹಿ ಯೋಜನೆಗಳು.',
    brandRep: 'ಉತ್ತಮ ಯಶಸ್ಸು',
    brandRepDesc: 'ನಿಮ್ಮ ಕಾರ್ಪೊರೇಟ್ ಬ್ರಾಂಡ್ ಘನತೆಯನ್ನು ಹೆಚ್ಚಿಸುವ ವೃತ್ತಿಪರ ಕಾರ್ಯಗತಗೊಳಿಸುವಿಕೆ.',
    riskMitigation: 'ಅಪಾಯ ನಿರ್ವಹಣೆ',
    riskMitigationDesc: 'ವಿಮೆ ಹೊಂದಿರುವ ವಿತರಕರು ಮತ್ತು ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳ ಸೂಕ್ತ ನಿರ್ವಹಣೆ.',
    guestExp: 'ಅತಿಥಿ ಸತ್ಕಾರ',
    guestExpDesc: 'ಪ್ರತಿಯೊಬ್ಬ ಅತಿಥಿಗೂ ಅತ್ಯುತ್ತಮ ಮತ್ತು ಸಂತೋಷದಾಯಕ ಅನುಭವ ನೀಡುವ ಯೋಜನೆ.'
  },
  ml: { // Malayalam
    navHome: 'ഹോം',
    navAbout: 'ഞങ്ങളെക്കുറിച്ച്',
    navServices: 'സേവനങ്ങൾ',
    navCeremonies: 'ആചാരങ്ങൾ',
    navGallery: 'ഗാലറി',
    navContact: 'ബന്ധപ്പെടുക',
    navBooking: 'ബുക്ക് ചെയ്യുക',
    heroTitle: 'അവിസ്മരണീയ നിമിഷങ്ങൾ, അത്യുജ്ജ്വല ആഘോഷങ്ങൾ',
    heroSubtitle: 'ദക്ഷിണേന്ത്യയിലെ പ്രമുഖ ഇവന്റ് മാനേജുമെന്റ് ഗ്രൂപ്പ്. പാരമ്പര്യ തനിമയും ആധുനിക കോർപ്പറേറ്റ് നിലവാരവും.',
    whyChooseUs: 'എന്തുകൊണ്ട് ജി.എസ് അസോസിയേറ്റ്സ്?',
    stressReduction: 'സമ്മർദ്ദരഹിതം',
    stressReductionDesc: 'തുടക്കം മുതൽ ഒടുക്കം വരെയുള്ള പ്ലാനിംഗ് ഞങ്ങൾ ചെയ്യുന്നതിനാൽ നിങ്ങൾക്ക് പൂർണ്ണ സമാധാനം.',
    costControl: 'കൃത്യമായ ബജറ്റ്',
    costControlDesc: 'മറഞ്ഞിരിക്കുന്ന നിരക്കുകളില്ലാത്ത സുതാര്യമായ പാക്കേജുകൾ.',
    brandRep: 'മികച്ച ബ്രാൻഡ് മൂല്യം',
    brandRepDesc: 'നിങ്ങളുടെ സ്ഥാപനത്തിന്റെ അന്തസ്സ് ഉയർത്തുന്ന മികച്ച പ്രൊഫഷണൽ രീതികൾ.',
    riskMitigation: 'സുരക്ഷാ മുൻകരുതലുകൾ',
    riskMitigationDesc: 'ഇൻഷുറൻസ് ഉള്ള വെണ്ടർമാരും മികച്ച അടിയന്തര പ്ലാനുകളും.',
    guestExp: 'അതിഥി സൽക്കാരം',
    guestExpDesc: 'ഓരോ അതിഥിക്കും ആസ്വദിക്കാൻ തക്കവണ്ണം മികച്ച ക്രമീകരണങ്ങൾ.'
  },
  hi: { // Hindi
    navHome: 'होम',
    navAbout: 'हमारे बारे में',
    navServices: 'सेवाएं',
    navCeremonies: 'समारोह',
    navGallery: 'गैलरी',
    navContact: 'संपर्क',
    navBooking: 'बुक करें',
    heroTitle: 'सहज आयोजन, उद्देश्यपूर्ण उत्सव',
    heroSubtitle: 'पारंपरिक दक्षिण भारतीय अनुष्ठानों और आधुनिक कॉर्पोरेट उत्कृष्टता का बेजोड़ मिश्रण।',
    whyChooseUs: 'जीएस एसोसिएट्स क्यों?',
    stressReduction: 'तनाव से मुक्ति',
    stressReductionDesc: 'हम शुरू से अंत तक पूरी योजना संभालते हैं ताकि आपको कोई चिंता न हो।',
    costControl: 'लागत नियंत्रण',
    costControlDesc: 'बिना किसी छुपे शुल्क के पारदर्शी पैकेज और बजट का पूर्ण पालन।',
    brandRep: 'बेहतर साख',
    brandRepDesc: 'आपके कॉर्पोरेट ब्रांड की प्रतिष्ठा को बढ़ाने वाला पेशेवर कार्यान्वयन।',
    riskMitigation: 'जोखिम न्यूनीकरण',
    riskMitigationDesc: 'बीमाकृत वेंडर, आपातकालीन योजनाएं और नियमों का पूर्ण पालन।',
    guestExp: 'अतिथि सत्कार',
    guestExpDesc: 'अतिथियों के अनुभव को यादगार बनाने के लिए हर विवरण को खूबसूरती से तैयार किया गया है।'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { translations };
