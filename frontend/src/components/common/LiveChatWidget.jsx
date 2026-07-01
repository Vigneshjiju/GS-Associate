import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Localizations for "Gowri" 🌸 Virtual Assistant
const localizations = {
  en: {
    welcome: "Namaskaram 🙏 Welcome to GS Associates. I am Gowri 🌸, your virtual assistant. How may I assist you with your ceremony or corporate event today?",
    nudge: "Would you like to explore our traditional services or start a booking consultation?",
    notKnow: "Let me connect you with our team for this. Would you like to leave your details?",
    pricingPrompt: "To give you a quote range, could you tell me the type of event, guest count, city, and preferred package tier? 😊",
    pricingGuardrail: "\n\nThese are approximate ranges. Our team will give you an exact itemized quote based on your specific requirements.",
    pricingNudge: "Want me to start a booking inquiry for you?",
    aboutCompany: "GS Associates creates seamless, purposeful gatherings that achieve specific goals — driving revenue, building brand awareness, educating audiences, or fostering community engagement. We deliver stress-free planning, optimized cost control, enhanced brand reputation, professional risk mitigation, and superior guest experiences. We have successfully managed 500+ events across South India. Would you like to look at our services or start a booking consultation? 😊",
    offTopic: "I am specialized in event coordination — let me help you plan a beautiful ceremony! 😊 Would you like to check our auspicious dates or booking packages?",
    complaintApology: "I sincerely apologize for this experience 🙏 I am escalating this to our senior coordinator right now. You will receive a call within 1 hour. Your reference number is #GS{timestamp}. May I confirm your phone number?",
    complaintConfirm: "Thank you. Escalation reference #GS{timestamp} is registered. Our manager will call you within 1 hour.",
    escalationMsg: "I am connecting you with our senior event coordinator right away 🙏\nYou will receive a call/WhatsApp from our team within 1–2 hours.\nYour reference number is #GS{timestamp}.\nCould you confirm your WhatsApp number so our team reaches you directly?",
    escalationConfirm: "Thank you! Our senior coordinator will reach out to you on {phone} within 1-2 hours. Reference: #GS{timestamp}.",
    muhurtham_confirm: "Namaskaram 🙏 Thank you! Our senior purohit panel will calculate the most auspicious muhurtham based on your Panchang details and confirm on {phone} within 24 hours. We are honoured to be part of your celebration! 🌸",
    booking_confirm: "Namaskaram 🙏 Thank you {name}! Your inquiry is confirmed. Our senior coordinator will reach you on {phone} within 2 hours. We are honoured to be part of your celebration! 🌸",
    booking_summary_header: "📋 BOOKING INQUIRY SUMMARY — GS Associates\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    booking_summary_footer: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Our team will contact you within 2 hours!\n\nReply YES to confirm or EDIT to change anything."
  },
  ta: {
    welcome: "வணக்கம் 🌸 ஜி.எஸ் அசோசியேட்ஸ்-க்கு வரவேற்கிறோம். நான் உங்கள் கௌரி 🌸. இன்று உங்கள் சடங்கு அல்லது கார்ப்பரேட் நிகழ்வுக்கு நான் எவ்வாறு உதவ முடியும்?",
    nudge: "எங்கள் பாரம்பரிய சேவைகளைப் பற்றி அறிய விரும்புகிறீர்களா அல்லது முன்பதிவு ஆலோசனையைத் தொடங்க விரும்புகிறீர்களா?",
    notKnow: "இது குறித்து எங்கள் குழுவுடன் உங்களை இணைக்கிறேன். உங்கள் விவரங்களை இங்கே பகிரலாமா?",
    pricingPrompt: "உங்களுக்கு தோராயமான பட்ஜெட்டை வழங்க, நிகழ்வு வகை, விருந்தினர் எண்ணிக்கை, நகரம் மற்றும் உங்கள் பட்ஜெட் தொகுப்பு ஆகியவற்றை கூற முடியுமா? 😊",
    pricingGuardrail: "\n\nஇவை தோராயமான வரம்புகள் மட்டுமே. உங்கள் குறிப்பிட்ட தேவைகளின் அடிப்படையில் எங்கள் குழு உங்களுக்கு சரியான விலையை வழங்கும்.",
    pricingNudge: "உங்களுக்கான முன்பதிவு ஆலோசனையைத் தொடங்கலாமா?",
    aboutCompany: "ஜி.எஸ் அசோசியேட்ஸ் தடையற்ற, நோக்கமுள்ள தென்னிந்திய நிகழ்வுகளை உருவாக்குகிறது. நாங்கள் மன அழுத்தம் இல்லாத திட்டமிடல், பட்ஜெட் கட்டுப்பாடு, சிறந்த விருந்தினர் அனுபவங்களை வழங்குகிறோம். தென்னிந்தியாவில் 500+ நிகழ்வுகளை நடத்தியுள்ளோம். முன்பதிவு செய்ய விரும்புகிறீர்களா?",
    offTopic: "நான் நிகழ்வு ஒருங்கிணைப்பில் நிபுணத்துவம் பெற்றவள் — ஒரு அழகான சடங்கைத் திட்டமிட உங்களுக்கு உதவுகிறேன்! 😊 எங்கள் முகூர்த்த தேதிகள் அல்லது முன்பதிவு பேக்கேஜ்களைப் பார்க்கலாமா?",
    complaintApology: "இந்த அனுபவத்திற்கு நான் மனப்பூர்வமாக மன்னிப்பு கேட்டுக்கொள்கிறேன் 🙏 இதை எங்கள் மூத்த ஒருங்கிணைப்பாளருக்கு உடனடியாக அனுப்புகிறேன். 1 மணி நேரத்திற்குள் உங்களுக்கு அழைப்பு வரும். உங்கள் குறிப்பு எண் #GS{timestamp}. உங்கள் தொலைபேசி எண்ணை உறுதிப்படுத்தலாமா?",
    complaintConfirm: "நன்றி. புகார் குறிப்பு எண் #GS{timestamp} பதிவு செய்யப்பட்டது. எங்கள் மேலாளர் 1 மணி நேரத்திற்குள் உங்களைத் தொடர்புகொள்வார்.",
    escalationMsg: "உங்களை எங்கள் மூத்த நிகழ்வு ஒருங்கிணைப்பாளருடன் உடனடியாக இணைக்கிறேன் 🙏\n1-2 மணி நேரத்திற்குள் எங்கள் குழு உங்களுடன் தொடர்பு கொள்ளும்.\nஉங்கள் குறிப்பு எண் #GS{timestamp}.\nஎங்கள் குழு உங்களை நேரடியாகத் தொடர்பு கொள்ள உங்கள் வாட்ஸ்அப் எண்ணை உறுதிப்படுத்த முடியுமா?",
    escalationConfirm: "நன்றி! எங்கள் ஒருங்கிணைப்பாளர் 1-2 மணி நேரத்திற்குள் உங்களை {phone} எண்ணில் தொடர்புகொள்வார். குறிப்பு எண்: #GS{timestamp}.",
    muhurtham_confirm: "வணக்கம் 🙏 நன்றி! பஞ்சாங்க விவரங்களின் அடிப்படையில் எங்கள் மூத்த புரோகிதர் குழு உங்களுக்கான சிறந்த முகூர்த்தத்தை கணித்து 24 மணி நேரத்திற்குள் {phone} எண்ணில் தொடர்புகொள்வர். உங்கள் கொண்டாட்டத்தில் இணைவதில் பெருமிதம் கொள்கிறோம்! 🌸",
    booking_confirm: "வணக்கம் 🙏 நன்றி {name}! உங்கள் முன்பதிவு உறுதி செய்யப்பட்டது. எங்கள் ஒருங்கிணைப்பாளர் 2 மணி நேரத்திற்குள் {phone} எண்ணில் உங்களை தொடர்புகொள்வார். உங்கள் கொண்டாட்டத்தில் இணைவதில் பெருமிதம் கொள்கிறோம்! 🌸",
    booking_summary_header: "📋 முன்பதிவு விவரங்களின் சுருக்கம் — GS Associates\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    booking_summary_footer: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ எங்கள் குழு 2 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்ளும்!\n\nஉறுதிப்படுத்த YES என்றும், மாற்ற EDIT என்றும் பதிலளிக்கவும்."
  },
  te: {
    welcome: "నమస్కారం 🙏 జి.ఎస్ అసోసియేట్స్ కి సుస్వాగతం. నేను గౌరి 🌸, మీ వర్చువల్ అసిస్టెంట్. ఈ రోజు మీ సాంప్రదాయ వేడుక లేదా కార్పొరేట్ ఈవెంట్ గురించి నేను మీకు ఎలా సహాయపడగలను?",
    nudge: "మా సాంప్రదాయ సేవలను అన్వేషించాలనుకుంటున్నారా లేదా బుకింగ్ సంప్రదింపులను ప్రారంభించాలనుకుంటున్నారా?",
    notKnow: "ఈ విషయమై మిమ్మల్ని మా బృందంతో అనుసంధానిస్తాను. మీ వివరాలను ఇక్కడ తెలపగలరా?",
    pricingPrompt: "ధర అంచనా కోసం, వేడుక రకం, అతిథుల సంఖ్య, నగరం మరియు మీ ప్యాకేజీ వివరాలను చెప్పగలరా? 😊",
    pricingGuardrail: "\n\nఇవి కేవలం సుమారు బడ్జెట్ అంచనాలు మాత్రమే. మీ ఖచ్చితమైన అవసరాలకు అనుగుణంగా మా బృందం మీకు వివరాలు అందిస్తుంది.",
    pricingNudge: "మీ ఈవెంట్ బుకింగ్ ఎంక్వైరీని ప్రారంభించమంటారా?",
    aboutCompany: "జి.ఎస్ అసోసియేట్స్ ప్రణాళికాబద్ధమైన దక్షిణ భారత వేడుకలను నిర్వహిస్తుంది. బడ్జెట్ నియంత్రణ, భద్రతా ప్రమాణాలు, అద్భుతమైన అతిథి మర్యాదలను అందిస్తాము. బుకింగ్ సంప్రదింపులను ప్రారంభించాలా?",
    offTopic: "నేను ఈవెంట్ ప్లానింగ్ నిపుణురాలిని — మీకు సహాయం చేయగలను! 😊 మా శుభ ముహూర్తం తేదీలను లేదా ప్యాకేజీలను పరిశీలిద్దామా?",
    complaintApology: "క్షమించండి 🙏 ఈ సమస్యను మా సీనియర్ కోఆర్డినేటర్‌కు వెంటనే పంపుతాను. మీకు 1 గంటలోపు కాల్ వస్తుంది. మీ రిఫరెన్స్ నంబర్ #GS{timestamp}. మీ ఫోన్ నంబర్‌ను నిర్ధారించగలరా?",
    complaintConfirm: "ధన్యవాదాలు. మీ ఫిర్యాదు రిఫరెన్స్ నంబర్ #GS{timestamp} నమోదైంది. మా మేనేజర్ 1 గంటలోపు సంప్రదిస్తారు.",
    escalationMsg: "మిమ్మల్ని మా సీనియర్ కోఆర్డినేటర్‌తో వెంటనే కనెక్ట్ చేస్తున్నాను 🙏\n1-2 గంటల్లో మా టీమ్ మిమ్మల్ని సంప్రదిస్తుంది.\nమీ రిఫరెన్స్ నంబర్ #GS{timestamp}.\nదయచేసి మీ వాట్సాప్ నంబర్‌ను ఇక్కడ నిర్ధారించగలరా?",
    escalationConfirm: "ధన్యవాదాలు! మా కోఆర్డినేటర్ 1-2 గంటల్లో మిమ్మల్ని {phone} లో సంప్రదిస్తారు. రిఫరెన్స్: #GS{timestamp}.",
    muhurtham_confirm: "నమస్కారం 🙏 ధన్యవాదాలు! పంచాంగం ఆధారంగా మా పూజారుల బృందం శుభ ముహూర్తాన్ని లెక్కించి 24 గంటల్లో {phone} లో మీకు తెలియజేస్తారు. మీ వేడుకలో భాగమవ్వడం మా అదృష్టం! 🌸",
    booking_confirm: "నమస్కారం 🙏 ధన్యవాదాలు {name}! మీ బుకింగ్ వివరాలు నమోదయ్యాయి. మా కోఆర్డినేటర్ 2 గంటల్లో {phone} లో మిమ్మల్ని సంప్రదిస్తారు. మీ వేడుకలో భాగమవ్వడం మా అదృష్టం! 🌸",
    booking_summary_header: "📋 బుకింగ్ సమ్మరీ — GS Associates\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    booking_summary_footer: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ మా బృందం 2 గంటల్లో సంప్రదిస్తుంది!\n\nధృవీకరించడానికి YES అని, మార్చడానికి EDIT అని టైప్ చేయండి."
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ 🙏 ಜಿ.ಎಸ್ ಅಸೋಸಿಯೇಟ್ಸ್ ಗೆ ಸುಸ್ವಾಗತ. ನಾನು ಗೌರಿ 🌸, ನಿಮ್ಮ ವರ್ಚುವಲ್ ಸಹಾಯಕ. ಇಂದು ನಿಮ್ಮ ಧಾರ್ಮಿಕ ವಿಧಿ ಅಥವಾ ಕಾರ್ಯಕ್ರಮದ ಯೋಜನೆಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    nudge: "ನಮ್ಮ ಸಾಂಪ್ರದಾಯಿಕ ಸೇವೆಗಳನ್ನು ತಿಳಿಯಲು ಬಯಸುವಿರಾ ಅಥವಾ ಬುಕಿಂಗ್ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪ್ರಾರಂಭಿಸೋಣವೇ?",
    notKnow: "ಈ ಬಗ್ಗೆ ವಿವರ ನೀಡಲು ನಮ್ಮ ತಂಡಕ್ಕೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ತಿಳಿಸುತ್ತೇನೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನೀಡಬಹುದೇ?",
    pricingPrompt: "ಬಜೆಟ್ ಅಂದಾಜಿಸಲು, ಕಾರ್ಯಕ್ರಮದ ವಿಧ, ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ, ನಗರ ಮತ್ತು ಪ್ಯಾಕೇಜ್ ಶ್ರೇಣಿ ತಿಳಿಸಬಹುದೇ? 😊",
    pricingGuardrail: "\n\nಇವು ಅಂದಾಜು ದರಗಳು ಮಾತ್ರ. ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ನಿಖರವಾದ ದರವನ್ನು ನಮ್ಮ ತಂಡ ನೀಡಲಿದೆ.",
    pricingNudge: "ಬುಕಿಂಗ್ ವಿಚಾರಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸೋಣವೇ?",
    aboutCompany: "ಜಿ.ಎಸ್ ಅಸೋಸಿಯೇಟ್ಸ್ ದಕ್ಷಿಣ ಭಾರತದ ಅದ್ಭುತ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಆಯೋಜಿಸುತ್ತದೆ. ಬಜೆಟ್ ಸ್ನೇಹಿ ಯೋಜನೆ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಅತಿಥಿ ಸತ್ಕಾರ ನಮ್ಮ ಗುರಿ. ಬುಕಿಂಗ್ ಸಂಪ್ರದಾಯವನ್ನು ಪ್ರಾರಂಭಿಸೋಣವೇ?",
    offTopic: "ನಾನು ಕಾರ್ಯಕ್ರಮ ನಿರ್ವಹಣೆಯಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿದ್ದೇನೆ — ಸುಂದರ ಆಚರಣೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ! 😊 ನಮ್ಮ ಶುಭ ದಿನಾಂಕಗಳನ್ನು ಅಥವಾ ಪ್ಯಾಕೇಜುಗಳನ್ನು ನೋಡೋಣವೇ?",
    complaintApology: "ನಮಗೆ ವಿಷಾದವಿದೆ 🙏 ಈ ದೂರನ್ನು ನಮ್ಮ ಹಿರಿಯ ಅಧಿಕಾರಿಗೆ ಕಳುಹಿಸುತ್ತಿದ್ದೇನೆ. 1 ಗಂಟೆಯೊಳಗೆ ಕರೆ ಬರುತ್ತದೆ. ನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ #GS{timestamp}. ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ಖಚಿತಪಡಿಸಿ.",
    complaintConfirm: "ಧನ್ಯವಾದಗಳು. ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ #GS{timestamp} ದಾಖಲಾಗಿದೆ. ನಮ್ಮ ಮ್ಯಾನೇಜರ್ ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸಲಿದ್ದಾರೆ.",
    escalationMsg: "ನಮ್ಮ ಹಿರಿಯ ಕೋಆರ್ಡಿನೇಟರ್ ಜೊತೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇನೆ 🙏\n1-2 ಗಂಟೆಗಳಲ್ಲಿ ನಮ್ಮ ತಂಡದವರು ಕರೆ ಮಾಡುತ್ತಾರೆ.\nನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ #GS{timestamp}.\nನಿಮ್ಮ ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆಯನ್ನು ದಯವಿಟ್ಟು ಖಚಿತಪಡಿಸಿ.",
    escalationConfirm: "ಧನ್ಯವಾದಗಳು! ನಮ್ಮ ತಂಡದವರು 1-2 ಗಂಟೆಯೊಳಗೆ {phone} ಸಂಖ್ಯೆಗೆ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ. ರೆಫರೆನ್ಸ್: #GS{timestamp}.",
    muhurtham_confirm: "ನಮಸ್ಕಾರ 🙏 ಧನ್ಯವಾದಗಳು! ಪಂಚಾಂಗದ ಆಧಾರದ ಮೇಲೆ ನಮ್ಮ ಪುರೋಹಿತರು ಶುಭ ಮುಹೂರ್ತವನ್ನು ಲೆಕ್ಕ ಹಾಕಿ 24 ಗಂಟೆಯೊಳಗೆ {phone} ಗೆ ತಿಳಿಸುತ್ತಾರೆ. ನಿಮ್ಮ ಸಂಭ್ರಮದ ಭಾಗವಾಗಲು ನಮಗೆ ಹೆಮ್ಮೆಯಿದೆ! 🌸",
    booking_confirm: "ನಮಸ್ಕಾರ 🙏 ಧನ್ಯವಾದಗಳು {name}! ನಿಮ್ಮ ವಿಚಾರಣೆ ದಾಖಲಾಗಿದೆ. 2 ಗಂಟೆಯೊಳಗೆ {phone} ಗೆ ನಮ್ಮ ತಂಡ ಸಂಪರ್ಕಿಸುತ್ತದೆ. ನಿಮ್ಮ ಸಂಭ್ರಮದ ಭಾಗವಾಗಲು ನಮಗೆ ಹೆಮ್ಮೆಯಿದೆ! 🌸",
    booking_summary_header: "📋 ಬುಕಿಂಗ್ ಮಾಹಿತಿ ವಿವರ — GS Associates\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    booking_summary_footer: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ ನಮ್ಮ ತಂಡ 2 ಗಂಟೆಗಳಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ!\n\nಖಚಿತಪಡಿಸಲು YES ಎಂದು, ತಿದ್ದುಪಡಿ ಮಾಡಲು EDIT ಎಂದು ಬರೆಯಿರಿ."
  },
  ml: {
    welcome: "നമസ്കാരം 🙏 ജി.എസ് അസോസിയേറ്റ്സിലേക്ക് സ്വാഗതം. ഞാൻ ഗൗരി 🌸, നിങ്ങളുടെ വിർച്വൽ അസിസ്റ്റന്റ്. ഇന്ന് നിങ്ങളുടെ ചടങ്ങ് അല്ലെങ്കിൽ കോർപ്പറേറ്റ് ഇവന്റ് പ്ലാൻ ചെയ്യാൻ ഞാൻ എങ്ങനെയാണ് സഹായിക്കേണ്ടത്?",
    nudge: "ഞങ്ങളുടെ പരമ്പരാഗത സേവനങ്ങളെക്കുറിച്ച് അറിയാൻ ആഗ്രഹിക്കുന്നുണ്ടോ അതോ ബുക്കിംഗ് ആരംഭിക്കണോ?",
    notKnow: "ഇതിനായി ഞാൻ നിങ്ങളെ ഞങ്ങളുടെ ടീമുമായി ബന്ധിപ്പിക്കാം. നിങ്ങളുടെ വിവരങ്ങൾ നൽകാമോ?",
    pricingPrompt: "നിരക്കറിയാനായി ഇവന്റ് ഏതാണ്, അതിഥികളുടെ എണ്ണം, സ്ഥലം, പാക്കേജ് എന്നിവ പറയാമോ? 😊",
    pricingGuardrail: "\n\nഇവ ഏകദേശ നിരക്കുകൾ മാത്രമാണ്. നിങ്ങളുടെ ആവശ്യങ്ങൾക്കനുസരിച്ച് കൃത്യമായ നിരക്കുകൾ ഞങ്ങളുടെ ടീം നൽകും.",
    pricingNudge: "ഞാൻ നിങ്ങളുടെ ബുക്കിംഗ് അന്വേഷണം ആരംഭിക്കട്ടെ?",
    aboutCompany: "സമ്മർദ്ദരഹിതമായ ഇവന്റ് പ്ലാനിംഗും മികച്ച അതിഥി സൽക്കാരവുമാണ് ജി.എസ് അസോസിയേറ്റ്സ് വാഗ്ദാനം ചെയ്യുന്നത്. ദക്ഷിണേന്ത്യയിലുടനീളം 500+ ചടങ്ങുകൾ വിജയകരമായി നടത്തിയിട്ടുണ്ട്. ബുക്കിംഗ് ആരംഭിക്കണോ?",
    offTopic: "ഞാൻ ഇവന്റ് പ്ലാനിംഗിൽ സഹായിക്കുന്ന ആളാണ് — മനോഹരമായ ഒരു ചടങ്ങ് പ്ലാൻ ചെയ്യാൻ സഹായിക്കാം! 😊 ശുഭ മുഹൂർത്ത തീയതികളോ പാക്കേജുകളോ നോക്കണോ?",
    complaintApology: "വന്ന ബുദ്ധിമുട്ടിൽ ഖേദിക്കുന്നു 🙏 ഞാൻ ഇത് ഞങ്ങളുടെ സീനിയർ കോർഡിനേറ്റർക്ക് കൈമാറുന്നു. 1 മണിക്കൂറിനകം വിളി വരും. റഫറൻസ് നമ്പർ: #GS{timestamp}. ഫോൺ നമ്പർ ഉറപ്പാക്കാമോ?",
    complaintConfirm: "നന്ദി. റഫറൻസ് നമ്പർ #GS{timestamp} രജിസ്റ്റർ ചെയ്തു. ഞങ്ങളുടെ മാനേജർ ഉടൻ ബന്ധപ്പെടും.",
    escalationMsg: "ഞാൻ നിങ്ങളെ ഞങ്ങളുടെ സീനിയർ കോർഡിനേറ്ററുമായി ബന്ധിപ്പിക്കാം 🙏\n1-2 മണിക്കൂറിനുള്ളിൽ ഞങ്ങളുടെ ടീം വിളിക്കും.\nറഫറൻസ് നമ്പർ: #GS{timestamp}.\nദയവായി നിങ്ങളുടെ വാട്സാപ്പ് നമ്പർ സ്ഥിരീകരിക്കാമോ?",
    escalationConfirm: "നന്ദി! ഞങ്ങളുടെ കോർഡിനേറ്റർ 1-2 മണിക്കൂറിനകം {phone} നമ്പറിൽ ബന്ധപ്പെടും. റഫറൻസ്: #GS{timestamp}.",
    muhurtham_confirm: "നമസ്കാരം 🙏 നന്ദി! ഞങ്ങളുടെ പൂജാരിമാർ ശുഭ മുഹൂർത്തം കണക്കാക്കി 24 മണിക്കൂറിനകം {phone} നമ്പറിൽ ബന്ധപ്പെടും. നിങ്ങളുടെ സന്തോഷങ്ങളിൽ പങ്കാളിയാകുന്നതിൽ സന്തോഷമുണ്ട്! 🌸",
    booking_confirm: "നമസ്കാരം 🙏 നന്ദി {name}! നിങ്ങളുടെ ബുക്കിംഗ് അന്വേഷണം സ്ഥിരീകരിച്ചു. 2 മണിക്കൂറിനുള്ളിൽ {phone} നമ്പറിൽ ഞങ്ങളുടെ ടീം ബന്ധപ്പെടും. നിങ്ങളെ സഹായിക്കാൻ കഴിഞ്ഞതിൽ സന്തോഷം! 🌸",
    booking_summary_header: "📋 ബുക്കിംഗ് അന്വേഷണ വിവരങ്ങൾ — GS Associates\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    booking_summary_footer: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ ഞങ്ങളുടെ ടീം 2 മണിക്കൂറിനകം ബന്ധപ്പെടും!\n\nസ്ഥിരീകരിക്കാൻ YES എന്നും, തിരുത്താൻ EDIT എന്നും അയക്കുക."
  },
  hi: {
    welcome: "नमस्कार 🙏 जीएस एसोसिएट्स में आपका स्वागत है। मैं गौरी 🌸, आपकी वर्चुअल असिस्टेंट हूँ। आज मैं आपकी शादी, पारंपरिक अनुष्ठान या कॉर्पोरेट इवेंट की योजना बनाने में कैसे मदद कर सकती हूँ?",
    nudge: "क्या आप हमारे पारंपरिक अनुष्ठानों के बारे में जानना चाहेंगे या बुकिंग परामर्श शुरू करना चाहेंगे?",
    notKnow: "मैं इस विषय पर आपको हमारी टीम से जोड़ देती हूँ। क्या आप अपनी जानकारी प्रदान करना चाहेंगे?",
    pricingPrompt: "बजट का सही अनुमान लगाने के लिए, कृपया इवेंट का प्रकार, मेहमानों की संख्या, शहर और पसंदीदा पैकेज बताएं? 😊",
    pricingGuardrail: "\n\nये केवल अनुमानित बजट सीमाएं हैं। हमारी टीम आपकी विशिष्ट आवश्यकताओं के आधार पर सटीक कोटेशन प्रदान करेगी।",
    pricingNudge: "क्या मैं आपकी बुकिंग पूछताछ शुरू करूँ?",
    aboutCompany: "जीएस एसोसिएट्स दक्षिण भारतीय समारोहों का कुशल आयोजन करता है। हम तनाव-मुक्त योजना, बजट नियंत्रण और बेहतर अतिथि सत्कार प्रदान करते हैं। 500 से अधिक सफल इवेंट्स का अनुभव है। क्या आप बुकिंग शुरू करना चाहेंगे?",
    offTopic: "मैं इवेंट प्लानिंग विशेषज्ञ हूँ — एक सुंदर समारोह की योजना बनाने में मैं आपकी मदद कर सकती हूँ! 😊 क्या आप शुभ मुहूर्त तिथियां या पैकेज देखना चाहेंगे?",
    complaintApology: "असुविधा के लिए मुझे बेहद खेद है 🙏 मैं इसे तुरंत अपने वरिष्ठ समन्वयक को भेज रही हूँ। आपको 1 घंटे में कॉल आएगा। आपका संदर्भ नंबर #GS{timestamp} है। कृपया फोन नंबर की पुष्टि करें।",
    complaintConfirm: "धन्यवाद। संदर्भ नंबर #GS{timestamp} दर्ज कर लिया गया है। हमारे प्रबंधक 1 घंटे में संपर्क करेंगे।",
    escalationMsg: "मैं आपको तुरंत हमारे वरिष्ठ समन्वयक से जोड़ रही हूँ 🙏\n1-2 घंटे में हमारी टीम आपसे संपर्क करेगी।\nसंदर्भ नंबर: #GS{timestamp}.\nकृपया पुष्टि के लिए अपना व्हाट्सएप नंबर प्रदान करें?",
    escalationConfirm: "धन्यवाद! हमारे वरिष्ठ समन्वयक 1-2 घंटे में आपसे {phone} पर संपर्क करेंगे। संदर्भ: #GS{timestamp}.",
    muhurtham_confirm: "नमस्कार 🙏 धन्यवाद! हमारे वरिष्ठ पुजारियों का पैनल पंचांग के अनुसार शुभ मुहूर्त की गणना कर 24 घंटे में आपसे {phone} पर संपर्क करेगा। आपके उत्सव का हिस्सा बनना हमारे लिए सम्मान की बात है! 🌸",
    booking_confirm: "नमस्कार 🙏 धन्यवाद {name}! आपकी पूछताछ दर्ज हो गई है। हमारी टीम 2 घंटे में आपसे {phone} पर संपर्क करेगी। आपके उत्सव का हिस्सा बनना हमारे लिए सम्मान की बात है! 🌸",
    booking_summary_header: "📋 बुकिंग पूछताछ विवरण — GS Associates\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    booking_summary_footer: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ हमारी टीम 2 घंटे के भीतर आपसे संपर्क करेगी!\n\nपुष्टि के लिए YES या बदलाव के लिए EDIT लिखें।"
  }
};

const labels = {
  en: { name: "Name", phone: "WhatsApp", event: "Event", date: "Date", city: "City", guests: "Guests", package: "Package", addons: "Add-ons", budget: "Budget" },
  ta: { name: "பெயர்", phone: "வாட்ஸ்அப்", event: "நிகழ்வு", date: "தேதி", city: "நகரம்", guests: "விருந்தினர்கள்", package: "பேக்கேஜ்", addons: "கூடுதல் சேவைகள்", budget: "பட்ஜெட்" },
  te: { name: "పేరు", phone: "వాట్సాప్", event: "వేడుక", date: "తేదీ", city: "నగరం", guests: "అతిథులు", package: "ప్యాకేజీ", addons: "అదనపు సేవలు", budget: "బడ్జెట్" },
  kn: { name: "ಹೆಸರು", phone: "ವಾಟ್ಸಾಪ್", event: "ಕಾರ್ಯಕ್ರಮ", date: "ದಿನಾಂక", city: "ನಗರ", guests: "ಅತಿಥಿಗಳು", package: "ಪ್ಯಾಕೇಜ್", addons: "ಹೆಚ್ಚುವರಿ ಸೇವೆಗಳು", budget: "ಬಜೆಟ್" },
  ml: { name: "പേര്", phone: "വാട്സാപ്പ്", event: "ഇവന്റ്", date: "തീയതി", city: "സ്ഥലം", guests: "അതിഥികൾ", package: "പാക്കേജ്", addons: "അധിക സേവനങ്ങൾ", budget: "ബജറ്റ്" },
  hi: { name: "नाम", phone: "व्हाट्सएप", event: "इवेंट", date: "तारीख", city: "शहर", guests: "मेहमान", package: "पैकेज", addons: "विशेष सेवाएँ", budget: "बजट" }
};

const stepQuestions = {
  1: {
    en: "May I know your full name? 😊",
    ta: "உங்கள் முழு பெயரை நான் தெரிந்து கொள்ளலாமா? 😊",
    te: "నేను మీ పూర్తి పేరు తెలుసుకోవచ్చా? 😊",
    kn: "ನಾನು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಯಬಹುದೇ? 😊",
    ml: "എനിക്ക് നിങ്ങളുടെ മുഴുവൻ പേര് അറിയാമോ? 😊",
    hi: "क्या मैं आपका पूरा नाम जान सकती हूँ? 😊"
  },
  2: {
    en: "Thank you {name}! What's your WhatsApp number?",
    ta: "நன்றி {name}! உங்கள் வாட்ஸ்அப் (WhatsApp) எண் என்ன?",
    te: "ధన్యవాదాలు {name}! మీ వాట్సాప్ (WhatsApp) నంబర్ ఏమిటి?",
    kn: "ಧನ್ಯವಾದಗಳು {name}! ನಿಮ್ಮ ವಾಟ್ಸಾಪ್ (WhatsApp) ಸಂಖ್ಯೆ ಏನು?",
    ml: "നന്ദി {name}! നിങ്ങളുടെ വാട്സാപ്പ് (WhatsApp) നമ്പർ എന്താണ്?",
    hi: "धन्यवाद {name}! आपका व्हाट्सएप (WhatsApp) नंबर क्या है?"
  },
  3: {
    en: "What type of event or ceremony are you planning?",
    ta: "நீங்கள் என்ன வகையான சடங்கு அல்லது நிகழ்வைத் திட்டமிடுகிறீர்கள்?",
    te: "మీరు ఏ రకమైన సాంప్రదాయ వేడుక లేదా ఈవెంట్‌ను ప్లాన్ చేస్తున్నారు?",
    kn: "ನೀವು ಯಾವ ರೀತಿಯ ಧಾರ್ಮಿಕ ವಿಧಿ ಅಥವಾ ಕಾರ್ಯಕ್ರಮವನ್ನು ಯೋಜಿಸುತ್ತಿದ್ದೀರಿ?",
    ml: "നിങ്ങൾ ഏതുതരം ചടങ്ങാണ് അല്ലെങ്കിൽ ഇവന്റാണ് പ്ലാൻ ചെയ്യുന്നത്?",
    hi: "आप किस प्रकार के समारोह या इवेंट की योजना बना रहे हैं?"
  },
  4: {
    en: "Do you have a tentative date or month in mind? (I can also help check auspicious muhurtham dates!)",
    ta: "மனதில் ஏதேனும் தற்காலிக தேதி அல்லது மாதம் உள்ளதா? (மங்களகரமான முகூர்த்த தேதிகளை சரிபார்க்கவும் நான் உதவ முடியும்!)",
    te: "మీకు ఏదైనా తాత్కాలిక తేదీ లేదా నెల ఉందా? (శుభ ముహూర్తం తేదీలను తనిఖీ చేయడానికి కూడా నేను సహాయం చేయగలను!)",
    kn: "ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ದಿನಾಂಕ ಅಥವಾ ತಿಂಗಳು ಇದೆಯೇ? (ಶುಭ ಮುಹೂರ್ತದ ದಿನಾಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಸಹ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ!)",
    ml: "ഒരു താല്ക്കാലിക തീയതിയോ മാസമോ മനസ്സിലുണ്ടോ? (ശുഭ മുഹൂർത്തം കണ്ടെത്താനും ഞാൻ സഹായിക്കാം!)",
    hi: "क्या आपके मन में कोई संभावित तारीख या महीना है? (मैं शुभ मुहूर्त तिथियां जांचने में भी मदद कर सकती हूँ!)"
  },
  5: {
    en: "Which city or venue area are you considering?",
    ta: "எந்த நகரம் அல்லது மண்டப பகுதியை நீங்கள் யோசித்து வருகிறீர்கள்?",
    te: "మీరు ఏ నగరం లేదా వేదిక స్థలాన్ని అనుకుంటున్నారు?",
    kn: "ನೀವು ಯಾವ ನಗರ ಅಥವಾ ಸ್ಥಳವನ್ನು ಪರಿಗಣಿಸುತ್ತಿದ್ದೀರಿ?",
    ml: "ഏത് നഗരത്തിലാണ് അല്ലെങ്കിൽ ഏത് സ്ഥലത്താണ് ചടങ്ങ് നടത്താൻ ഉദ്ദേശിക്കുന്നത്?",
    hi: "आप किस शहर या स्थान पर विचार कर रहे हैं?"
  },
  6: {
    en: "Approximately how many guests are you expecting?",
    ta: "தோராயமாக எத்தனை விருந்தினர்களை எதிர்பார்க்கிறீர்கள்?",
    te: "సుమారుగా ఎంతమంది అతిథులు వస్తారని అనుకుంటున్నారు?",
    kn: "ಸರಿಸುಮಾರು ಎಷ್ಟು ಜನ ಅತಿಥಿಗಳನ್ನು ನೀವು ನಿರೀಕ್ಷಿಸುತ್ತಿದ್ದೀರಿ?",
    ml: "ഏകദേശം എത്ര അതിഥികളെയാണ് നിങ്ങൾ പ്രതീക്ഷിക്കുന്നത്?",
    hi: "अनुमानित रूप से कितने मेहमानों के आने की उम्मीद है?"
  },
  7: {
    en: "Which package tier interests you? Basic / Premium / Luxury / Not Sure Yet",
    ta: "எந்த தொகுப்பு (Package Tier) உங்களுக்கு விருப்பமானது? Basic / Premium / Luxury / இன்னும் உறுதியாக தெரியவில்லை",
    te: "మీరు ఏ ప్యాకేజీని ఎంచుకోవాలనుకుంటున్నారు? Basic / Premium / Luxury / ఇంకా ఖరారు కాలేదు",
    kn: "ನಿಮಗೆ ಯಾವ ಪ್ಯಾಕೇಜ್ ಆಸಕ್ತಿಯಿದೆ? Basic / Premium / Luxury / ಇನ್ನು ಖಚಿತವಾಗಿಲ್ಲ",
    ml: "ഏത് പാക്കേജാണ് നിങ്ങൾക്ക് താല്പര്യം? Basic / Premium / Luxury / ഇതുവരെ ഉറപ്പിച്ചിട്ടില്ല",
    hi: "कौन सा पैकेज आपके लिए सही रहेगा? Basic / Premium / Luxury / अभी निश्चित नहीं है"
  },
  8: {
    en: "Any specific add-ons in mind? (e.g. priest, catering, decor, photography, nadaswaram, transport)",
    ta: "கூடுதல் சேவைகள் (Add-ons) ஏதேனும் தேவையா? (எ.கா. ஐயர், சமையல், அலங்காரம், புகைப்படம், நாதஸ்வரம், போக்குவரத்து)",
    te: "ఏదైనా అదనపు సేవలు (Add-ons) కావాలా? (ఉదా. పూజారి, క్యాటరింగ్, డెకరేషన్, ఫోటోగ్రఫీ, నాదస్వరం, రవాణా)",
    kn: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಹೆಚ್ಚುವರಿ ಸೇವೆಗಳು ಮನಸ್ಸಿನಲ್ಲಿವೆಯೇ? (ಉದಾ. ಪುರೋಹಿತರು, ಅಡುಗೆ, ಅಲಂಕಾರ, ಛಾಯಾಗ್ರಹಣ, ನಾದಸ್ವರ, ಸಾರಿಗೆ)",
    ml: "മറ്റു പ്രത്യേക സേവനങ്ങൾ വല്ലതും ആവശ്യമുണ്ടോ? (ഉദാ. പൂജാരി, കാറ്ററിംഗ്, ഡെക്കറേഷൻ, ഫോട്ടോഗ്രാഫി, നാദസ്വരം, യാത്ര സൌകര്യം)",
    hi: "क्या कोई अन्य विशेष सेवाएँ चाहिए? (जैसे कि पुजारी, कैटरिंग, डेकोरेशन, फोटोग्राफी, नादस्वरम, ट्रांसपोर्ट)"
  },
  9: {
    en: "What is your approximate budget range? (optional but helpful)",
    ta: "உங்களது தோராயமான பட்ஜெட் வரம்பு என்ன? (விருப்பப்பட்டால் பகிரலாம்)",
    te: "మీ సుమారు బడ్జెట్ ఎంత? (తప్పనిసరి కాదు, కానీ సహాయపడుతుంది)",
    kn: "ನಿಮ್ಮ ಅಂದಾಜು ಬಜೆಟ್ ಎಷ್ಟು? (ಐಚ್ಛಿಕ ಆದರೆ ಉಪಯುಕ್ತ)",
    ml: "നിങ്ങളുടെ ഏകദേശ ബജറ്റ് എത്രയാണ്? (നിർബന്ധമില്ല)",
    hi: "आपका अनुमानित बजट कितना है? (वैकल्पिक)"
  }
};

const optionTranslations = {
  YES: { en: "YES", ta: "ஆம் (YES)", te: "అవును (YES)", kn: "ಹೌದು (YES)", ml: "അതെ (YES)", hi: "हाँ (YES)" },
  EDIT: { en: "EDIT", ta: "திருத்து (EDIT)", te: "మార్చు (EDIT)", kn: "ಬದಲಾಯಿಸಿ (EDIT)", ml: "തിരുത്തുക (EDIT)", hi: "बदलें (EDIT)" }
};

const tierOptions = {
  en: ["Basic", "Premium", "Luxury", "Not Sure Yet"],
  ta: ["Basic", "Premium", "Luxury", "இன்னும் உறுதியாக தெரியவில்லை"],
  te: ["Basic", "Premium", "Luxury", "ఖరారు కాలేదు"],
  kn: ["Basic", "Premium", "Luxury", "ಖಚಿತವಾಗಿಲ್ಲ"],
  ml: ["Basic", "Premium", "Luxury", "ഉറപ്പില്ല"],
  hi: ["Basic", "Premium", "Luxury", "निश्चित नहीं"]
};

const muhurthamQuestions = {
  1: {
    en: "May I know your preferred month and year for the ceremony? 📅",
    ta: "சடங்கு நடத்த உங்களது தற்காலிக மாதம் மற்றும் வருடம் என்ன? 📅",
    te: "వేడుక కోసం మీ ప్రాధాన్యత కలిగిన నెల మరియు సంవత్సరం ఏమిటి? 📅",
    kn: "ಕಾರ್ಯಕ್ರಮಕ್ಕಾಗಿ ನಿಮ್ಮ ಆದ್ಯತೆಯ ತಿಂಗಳು ಮತ್ತು ವರ್ಷ ಯಾವುದು? 📅",
    ml: "ചടങ്ങ് നടത്താൻ ഉദ്ദേശിക്കുന്ന മാസവും വർഷവും ഏതാണ്? 📅",
    hi: "समारोह के लिए आपके पसंदीदा महीने और वर्ष क्या हैं? 📅"
  },
  2: {
    en: "Thank you. What is the birth star (Nakshatra) of the bride, groom, or key family member? 🌟",
    ta: "நன்றி. மணமகன், மணமகள் அல்லது சடங்கு நடத்தப்படும் முக்கிய நபரின் பிறந்த நட்சத்திரம் என்ன? 🌟",
    te: "ధన్యవాదాలు. వధూవరులు లేదా ప్రధాన వ్యక్తి యొక్క జన్మ నక్షత్రం ఏమిటి? 🌟",
    kn: "ಧನ್ಯವಾದಗಳು. ವಧು, ವರ ಅಥವಾ ಮುಖ್ಯ ವ್ಯಕ್ತಿಯ ಜನ್ಮ ನಕ್ಷತ್ರ ಯಾವುದು? 🌟",
    ml: "നന്ദി. വധു, വരൻ അല്ലെങ്കിൽ പ്രധാന വ്യക്തിയുടെ ജന്മനക്ഷത്രം എന്താണ്? 🌟",
    hi: "धन्यवाद। दूल्हा, दुल्हन या मुख्य व्यक्ति का जन्म नक्षत्र क्या है? 🌟"
  },
  3: {
    en: "Do you know your family's gotra, mutt affiliation, or Veda branch? (Optional, you can type 'Not Sure')",
    ta: "உங்கள் குடும்பத்தின் கோத்திரம், மடம் அல்லது வேத பிரிவு தெரியுமா? (தேவைப்பட்டால் மட்டும், இல்லையெனில் 'தெரியாது' என டைப் செய்யலாம்)",
    te: "మీ కుటుంబ గోత్రం, మఠం లేదా వేద శాఖ వివరాలు తెలుసా? (లేకుంటే 'తెలియదు' అని టైప్ చేయవచ్చు)",
    kn: "ನಿಮ್ಮ ಕುಟುಂಬದ ಗೋತ್ರ, ಮಠ ಅಥವಾ ವೇದ ಶಾಖೆ ಗೊತ್ತೇ? (ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ 'ಗೊತ್ತಿಲ್ಲ' ಎಂದು ಬರೆಯಬಹುದು)",
    ml: "കുടുംബത്തിന്റെ ഗോത്രം, മഠം അല്ലെങ്കിൽ വേദ ശാഖ അറിയാമോ? (അറിയില്ലെങ്കിൽ 'അറിയില്ല' എന്ന് എഴുതാം)",
    hi: "क्या आपको अपने परिवार का गोत्र, मठ या वेद शाखा पता है? (अनिवार्य नहीं है, आप 'पता नहीं' लिख सकते हैं)"
  },
  4: {
    en: "Got it. May I have your full name and WhatsApp number so our priest coordinator can contact you with the custom muhurthams?",
    ta: "சரி. எங்கள் புரோகிதர் உங்களை முகೂர்த்த தேதிகளுடன் தொடர்புகொள்ள உங்கள் முழு பெயர் மற்றும் வாட்ஸ்அப் எண் கூற முடியுமா?",
    te: "సరే. మా పూజారి వివరాలతో మిమ్మల్ని సంప్రదించడానికి మీ పూర్తి పేరు మరియు వాట్సాప్ నంబర్ చెప్పండి?",
    kn: "ಸರಿ. ಶುಭ ಮುಹೂರ್ತಗಳ ವಿವರಗಳೊಂದಿಗೆ ನಮ್ಮ ಪುರೋಹಿತರು ಸಂಪರ್ಕಿಸಲು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ ನೀಡಿ?",
    ml: "ശരി. శుభ ಮುಹൂർത്തങ്ങളുമായി ഞങ്ങളുടെ പൂജാരി ബന്ധപ്പെടാൻ നിങ്ങളുടെ മുഴുവൻ പേരും വാട്സാപ്പ് നമ്പറും തരാമോ?",
    hi: "ठीक है। शुभ मुहूर्त के विवरण के साथ हमारे पुजारी आपसे संपर्क कर सकें, इसके लिए कृपया अपना नाम और व्हाट्सएप नंबर दें?"
  }
};

const getLocalizedText = (key, langCode, variables = {}) => {
  let text = localizations[langCode]?.[key] || localizations['en']?.[key] || '';
  Object.keys(variables).forEach(v => {
    text = text.replace(new RegExp(`{${v}}`, 'g'), variables[v]);
  });
  return text;
};

const makeSummaryText = (data, l) => {
  const lbl = labels[l] || labels['en'];
  const header = getLocalizedText('booking_summary_header', l);
  const footer = getLocalizedText('booking_summary_footer', l);
  return `${header}
👤 ${lbl.name}       : ${data.name}
📞 ${lbl.phone}   : ${data.phone}
🎉 ${lbl.event}      : ${data.event}
📅 ${lbl.date}       : ${data.date}
📍 ${lbl.city}       : ${data.city}
👥 ${lbl.guests}     : ${data.guests}
📦 ${lbl.package}    : ${data.package}
✨ ${lbl.addons}    : ${data.addons}
💰 ${lbl.budget}     : ${data.budget || 'N/A'}
${footer}`;
};

export default function LiveChatWidget() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Custom Flow States for "Gowri" 🌸
  const [activeFlow, setActiveFlow] = useState('none'); // 'none' | 'booking' | 'muhurtham' | 'complaint' | 'escalate'
  const [flowStep, setFlowStep] = useState(0);
  const [flowData, setFlowData] = useState({});

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // Initial welcome message from Gowri 🌸
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: getLocalizedText('welcome', lang),
          options: [
            { label: 'Book Consultation 📅', value: 'start_booking' },
            { label: 'Check Auspicious Dates 🌟', value: 'start_muhurtham' },
            { label: 'Traditional Ceremonies 📿', value: 'explain_ceremonies' },
            { label: 'Pricing Estimate 🧮', value: 'explain_pricing' },
            { label: 'Change Language 🌐', value: 'change_lang' }
          ]
        }
      ]);
    }
  }, [messages, lang]);

  const addMessage = (text, sender, options = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender,
      text,
      options
    }]);
  };

  // Language detector
  const detectLanguage = (text) => {
    const t = text.toLowerCase();
    if (/[\u0b80-\u0bff]/.test(t) || t.includes('vanakkam') || t.includes('nandri') || t.includes('enna')) return 'ta';
    if (/[\u0c00-\u0c7f]/.test(t) || t.includes('namaskaram') || t.includes('ela') || t.includes('dhanyavadalu')) return 'te';
    if (/[\u0c80-\u0cff]/.test(t) || t.includes('namaskara') || t.includes('hege') || t.includes('dhanyavada')) return 'kn';
    if (/[\u0d00-\u0d7f]/.test(t) || t.includes('sugamano') || t.includes('nanni') || t.includes('entha')) return 'ml';
    if (/[\u0900-\u097f]/.test(t) || t.includes('namaste') || t.includes('kaise') || t.includes('shukriya') || t.includes('kya')) return 'hi';
    return lang; // fallback to active language context
  };

  const handleOptionClick = (value) => {
    // Label display handling
    let userLabel = value;
    if (value === 'start_booking') userLabel = "Book a Consultation";
    else if (value === 'start_muhurtham') userLabel = "Check Auspicious Dates";
    else if (value === 'explain_ceremonies') userLabel = "Explain Ceremonies";
    else if (value === 'explain_pricing') userLabel = "Cost Estimation";
    else if (value === 'change_lang') userLabel = "Change Language";
    else if (value.startsWith('set_lang_')) userLabel = value.split('_')[2].toUpperCase();

    addMessage(userLabel, 'user');
    setTimeout(() => {
      processOption(value);
    }, 400);
  };

  const processOption = (value) => {
    // Flow starts
    if (value === 'start_booking') {
      setActiveFlow('booking');
      setFlowStep(1);
      setFlowData({});
      const prompt = stepQuestions[1][lang];
      addMessage(prompt, 'bot');
    } else if (value === 'start_muhurtham') {
      setActiveFlow('muhurtham');
      setFlowStep(1);
      setFlowData({});
      const prompt = muhurthamQuestions[1][lang];
      addMessage(prompt, 'bot');
    } else if (value === 'explain_ceremonies') {
      addMessage(
        "We plan Upanayanam (thread ceremony), Seemantham (baby shower), Griha Pravesh (housewarming), and Milestone Birthdays like Sashtiabdapoorthi (60th) and Sathabhishekam (80th). We arrange Vedic scholars, ritual setup, and Sattvic catering. Which ceremony would you like to explore? 🌸",
        'bot',
        [
          { label: 'Sashtiabdapoorthi (60th)', value: 'info_sashti' },
          { label: 'Upanayanam (Thread)', value: 'info_upanayanam' },
          { label: 'Seemantham (Shower)', value: 'info_seemantham' },
          { label: 'Griha Pravesh (House)', value: 'info_griha' },
          { label: 'Veda Parayanam (Recitation)', value: 'info_parayanam' }
        ]
      );
    } else if (value === 'explain_pricing') {
      addMessage(getLocalizedText('pricingPrompt', lang), 'bot');
    } else if (value === 'change_lang') {
      addMessage(
        "Please select your language / மொழியைத் தேர்ந்தெடுக்கவும்:",
        'bot',
        [
          { label: 'English', value: 'set_lang_en' },
          { label: 'தமிழ் (Tamil)', value: 'set_lang_ta' },
          { label: 'తెలుగు (Telugu)', value: 'set_lang_te' },
          { label: 'ಕನ್ನಡ (Kannada)', value: 'set_lang_kn' },
          { label: 'മലയാളം (Malayalam)', value: 'set_lang_ml' },
          { label: 'हिंदी (Hindi)', value: 'set_lang_hi' }
        ]
      );
    } else if (value.startsWith('set_lang_')) {
      const selected = value.split('_')[2];
      setLang(selected);
      addMessage(`Language changed. ${getLocalizedText('nudge', selected)}`, 'bot', [
        { label: 'Book Consultation 📅', value: 'start_booking' },
        { label: 'Check Auspicious Dates 🌟', value: 'start_muhurtham' }
      ]);
    }
    // Ceremony info
    else if (value === 'info_sashti') {
      addMessage(
        "Sashtiabdapoorthi (60th birthday) is a sacred 2-day ceremony marking completion of a 60-year lunar cycle. It includes symbolic re-wedding (Kalyana Veduka), Navagraha Homa, and Kalasha Abhishekam. GS Associates coordinates senior purohits, puja samagri, and Sattvic catering. Would you like to book this or get an estimate? 🌸",
        'bot',
        [{ label: 'Book Consultation 📅', value: 'start_booking' }, { label: 'Pricing Estimate 🧮', value: 'explain_pricing' }]
      );
    } else if (value === 'info_upanayanam') {
      addMessage(
        "Upanayanam (Thread Ceremony) marks entry into student life. It includes Vastu-compliant layouts, thread investiture, and purification rituals. GS Associates manages certified purohits, pooja kits, and Sattvic catering. Would you like to book this or get an estimate? 🌸",
        'bot',
        [{ label: 'Book Consultation 📅', value: 'start_booking' }, { label: 'Pricing Estimate 🧮', value: 'explain_pricing' }]
      );
    } else if (value === 'info_seemantham') {
      addMessage(
        "Seemantham (traditional baby shower) blessings are celebrated in the 7th month. It includes fresh jasmine/marigold flower decors, music, glass bangles ceremony, and traditional food. GS Associates manages decor, bangles, and catering. Would you like to book this or get an estimate? 🌸",
        'bot',
        [{ label: 'Book Consultation 📅', value: 'start_booking' }, { label: 'Pricing Estimate 🧮', value: 'explain_pricing' }]
      );
    } else if (value === 'info_griha') {
      addMessage(
        "Griha Pravesh (housewarming) aligns your home with positive Vastu. It includes cow entry booking, Ganapati/Vastu homams, milk-boiling rites, and Sattvic catering. GS Associates handles all cow transport, purohits, and decors. Would you like to book this or get an estimate? 🌸",
        'bot',
        [{ label: 'Book Consultation 📅', value: 'start_booking' }, { label: 'Pricing Estimate 🧮', value: 'explain_pricing' }]
      );
    } else if (value === 'info_parayanam') {
      addMessage(
        "Veda Parayanam involves continuous Vedic chanting (Rudram, Sahasranama) by scholars for health, prosperity, or shanti. GS Associates manages Vedic scholars, audio setups, and remote livestreaming. Would you like to book this or get an estimate? 🌸",
        'bot',
        [{ label: 'Book Consultation 📅', value: 'start_booking' }, { label: 'Pricing Estimate 🧮', value: 'explain_pricing' }]
      );
    }
    // Summary responses
    else if (value === 'YES') {
      handleBookingConfirmation();
    } else if (value === 'EDIT') {
      setFlowStep(1);
      setFlowData({});
      addMessage(stepQuestions[1][lang], 'bot');
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue;
    addMessage(text, 'user');
    setInputValue('');

    const detected = detectLanguage(text);
    if (detected !== lang) {
      setLang(detected);
    }

    setTimeout(() => {
      if (activeFlow !== 'none') {
        handleFlowInput(text, detected);
      } else {
        handleGeneralInput(text, detected);
      }
    }, 600);
  };

  const handleFlowInput = async (text, userLang) => {
    if (activeFlow === 'booking') {
      const step = flowStep;

      // VIP Escalation check during flow
      if (step === 6 && isVipGuests(text)) {
        triggerEscalation(`VIP booking with high guest count: ${text} guests.`, userLang);
        return;
      }
      if (step === 9 && isVipBudget(text)) {
        triggerEscalation(`VIP booking with high budget: ${text}.`, userLang);
        return;
      }

      // Save step data
      const fieldMap = {
        1: 'name',
        2: 'phone',
        3: 'event',
        4: 'date',
        5: 'city',
        6: 'guests',
        7: 'package',
        8: 'addons',
        9: 'budget'
      };
      const field = fieldMap[step];
      const updatedData = { ...flowData, [field]: text };
      setFlowData(updatedData);

      if (step < 9) {
        const nextStep = step + 1;
        setFlowStep(nextStep);
        let prompt = stepQuestions[nextStep][userLang].replace('{name}', updatedData.name || '');

        // Custom interactive options for specific steps
        let options = null;
        if (nextStep === 7) {
          options = tierOptions[userLang].map(opt => ({ label: opt, value: opt }));
        }

        addMessage(prompt, 'bot', options);
      } else {
        // Step 10: Show summary
        setFlowStep(10);
        const summary = makeSummaryText(updatedData, userLang);
        const yesLabel = optionTranslations.YES[userLang] || 'YES';
        const editLabel = optionTranslations.EDIT[userLang] || 'EDIT';
        addMessage(summary, 'bot', [
          { label: yesLabel, value: 'YES' },
          { label: editLabel, value: 'EDIT' }
        ]);
      }
    }

    else if (activeFlow === 'muhurtham') {
      const step = flowStep;
      const fieldMap = {
        1: 'month_year',
        2: 'nakshatra',
        3: 'gotra_veda',
        4: 'contact'
      };
      const field = fieldMap[step];
      const updatedData = { ...flowData, [field]: text };
      setFlowData(updatedData);

      if (step < 4) {
        const nextStep = step + 1;
        setFlowStep(nextStep);
        let prompt = muhurthamQuestions[nextStep][userLang];
        let options = null;
        if (nextStep === 3) {
          options = [{ label: userLang === 'hi' ? 'पता नहीं' : 'Not Sure', value: 'Not Sure' }];
        }
        addMessage(prompt, 'bot', options);
      } else {
        // Finish muhurtham flow
        setActiveFlow('none');
        setFlowStep(0);

        // Extract name and phone from contact string
        const contactInfo = updatedData.contact;
        const namePart = contactInfo.replace(/[0-9+()-\s]/g, '').trim() || 'Muhurtham Lead';
        const phonePart = contactInfo.replace(/[^0-9]/g, '').trim() || contactInfo;

        try {
          await axios.post('/api/inquiries', {
            name: namePart,
            phone: phonePart,
            event_type: 'Muhurtham Consultation',
            message: `Panchang Details: Nakshatra: ${updatedData.nakshatra}, Gotra/Veda: ${updatedData.gotra_veda}, Target Date: ${updatedData.month_year}`
          });
        } catch (err) {
          console.error('Failed to log muhurtham lead:', err.message);
        }

        const successMsg = getLocalizedText('muhurtham_confirm', userLang, { phone: phonePart });
        addMessage(successMsg, 'bot', [
          { label: 'Traditional Ceremonies 📿', value: 'explain_ceremonies' },
          { label: 'Main Menu', value: 'main_menu' }
        ]);
      }
    }

    else if (activeFlow === 'complaint') {
      setActiveFlow('none');
      setFlowStep(0);
      const phone = text;
      const timestamp = Date.now().toString().slice(-6);

      try {
        await axios.post('/api/inquiries', {
          name: `Complaint Ref: #GS${timestamp}`,
          phone: phone,
          event_type: 'Complaint Escalation',
          message: `Customer complaint escalated to manager: ${flowData.complaintText}`
        });
      } catch (err) {
        console.error('Failed to log complaint:', err.message);
      }

      addMessage(getLocalizedText('complaintConfirm', userLang, { timestamp }), 'bot', [
        { label: 'Main Menu', value: 'main_menu' }
      ]);
    }

    else if (activeFlow === 'escalate') {
      setActiveFlow('none');
      setFlowStep(0);
      const phone = text;
      const timestamp = Date.now().toString().slice(-6);

      try {
        await axios.post('/api/inquiries', {
          name: `VIP/Escalation Ref: #GS${timestamp}`,
          phone: phone,
          event_type: 'VIP Escalation',
          message: `Escalated directly by Gowri: ${flowData.escalateReason}`
        });
      } catch (err) {
        console.error('Failed to log escalation lead:', err.message);
      }

      addMessage(getLocalizedText('escalationConfirm', userLang, { phone, timestamp }), 'bot', [
        { label: 'Main Menu', value: 'main_menu' }
      ]);
    }
  };

  const handleGeneralInput = async (text, userLang) => {
    const query = text.toLowerCase();

    // Check booking trigger words
    if (/\b(book|interest|plan|enquire|register|consult|start|wizard|inquiry|consultation)\b/.test(query)) {
      setActiveFlow('booking');
      setFlowStep(1);
      setFlowData({});
      addMessage(stepQuestions[1][userLang], 'bot');
      return;
    }

    // Check muhurtham trigger words
    if (/\b(muhurtham|panchang|auspicious|nakshatra|gotra|star|priest|dates)\b/.test(query)) {
      setActiveFlow('muhurtham');
      setFlowStep(1);
      setFlowData({});
      addMessage(muhurthamQuestions[1][userLang], 'bot');
      return;
    }

    // Check complaints trigger words
    if (/\b(complain|bad|worst|unhappy|terrible|angry|suck|poor|refund|cancel)\b/.test(query)) {
      const timestamp = Date.now().toString().slice(-6);
      setActiveFlow('complaint');
      setFlowStep(1);
      setFlowData({ complaintText: text });
      addMessage(getLocalizedText('complaintApology', userLang, { timestamp }), 'bot');
      return;
    }

    // Direct escalations triggers
    if (/\b(manager|contract|invoice|human|person|speak to support|agent|refund)\b/.test(query)) {
      triggerEscalation(`User requested direct human escalation. Query: "${text}"`, userLang);
      return;
    }

    // Check if Gemini API key is present and configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const hasApiKey = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '';

    if (hasApiKey) {
      setIsTyping(true);
      try {
        // Build Gemini chat history from recent messages
        const chatHistory = messages.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        const systemPrompt = `You are Gowri 🌸, a warm and helpful virtual assistant for GS Associates, a premium South Indian event management and wedding planning company.
Your tone must be polite, respectful, and culturally warm (using terms like 'Namaskaram 🙏' or language-appropriate traditional greetings).
GS Associates specializes in South Indian traditional ceremonies, weddings, corporate events, and religious events.
Here is some key knowledge you must use to answer user queries:
- Event Categories & Services:
  * Weddings: Stress-free planning, customized decoration, guest management, and catering.
  * Upanayanam (Thread Ceremony): Sacred thread ceremony marking student life, Vastu-compliant setup, purohits coordination, pooja kits, and Sattvic catering. Cost ranges from ₹75,000 to ₹2,00,000.
  * Seemantham (Baby Shower): Celebrated in the 7th month, marigold/jasmine decor, traditional music, glass bangles ceremony, and traditional food feast. Cost ranges from ₹75,000 to ₹2,00,000.
  * Sashtiabdapoorthi (60th birthday) & Sathabhishekam (80th birthday): Milestones celebrating life. Sashtiabdapoorthi includes re-wedding rituals, Navagraha Homa, and Kalasha Abhishekam. Cost ranges from ₹1,50,000 to ₹5,00,000.
  * Griha Pravesh (Housewarming): Ganapati/Vastu homams, cow entry booking, milk-boiling rites, and Sattvic catering. Cost ranges from ₹25,000 to ₹75,000.
  * Veda Parayanam / Akhanda Parayanam / Group Parayanam: Sacred continuous Vedic recitations (Rudram, Sahasranama) by panels of Vedic scholars. Cost ranges from ₹50,000 to ₹3,00,000.
  * Annaprasanam: First rice-feeding ceremony for babies.
- Pricing Packages:
  * Basic: Simple traditional decor, basic catering, necessary rituals coordination.
  * Premium: Quality decor, professional photography, elaborate multi-course catering, superior coordinator support.
  * Luxury: Elite floral designers, premium photography & video, luxury transportation, multi-cuisine/royal Sattvic catering, dedicated manager.
- Important instructions:
  1. Always respond in the language the user wrote in (detect and reply in English, Tamil, Telugu, Kannada, Malayalam, or Hindi).
  2. If the user asks off-topic questions (e.g., politics, movies, sports, weather), politely direct them back to event planning.
  3. For booking or detailed custom estimates, encourage them to click "Book Consultation 📅" or "Check Auspicious Dates 🌟".
  4. Keep responses concise, warm, and structured so they fit nicely in a chat window. Do not write extremely long paragraphs. Make sure to use emojis appropriately.`;

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              ...chatHistory,
              { role: 'user', parts: [{ text }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Namaskaram 🙏 How can I assist you today? 🌸";
        setIsTyping(false);
        addMessage(reply, 'bot', [
          { label: 'Book Consultation 📅', value: 'start_booking' },
          { label: 'Check Auspicious Dates 🌟', value: 'start_muhurtham' },
          { label: 'Traditional Ceremonies 📿', value: 'explain_ceremonies' }
        ]);
      } catch (err) {
        console.error('Gemini API call failed:', err);
        setIsTyping(false);
        runRulesBasedFallback(text, userLang);
      }
    } else {
      runRulesBasedFallback(text, userLang);
    }
  };

  const runRulesBasedFallback = (text, userLang) => {
    const query = text.toLowerCase();

    // Check pricing trigger words
    if (/\b(price|cost|how much|estimate|quote|budget|charge|rate|tariff)\b/.test(query)) {
      // Parse pricing details if provided in text
      let eventType = "Pooja";
      if (query.includes('wedding')) eventType = "wedding";
      else if (query.includes('upanayanam') || query.includes('thread')) eventType = "upanayanam";
      else if (query.includes('seemantham') || query.includes('shower')) eventType = "seemantham";
      else if (query.includes('sashti') || query.includes('60th')) eventType = "sashti";
      else if (query.includes('corporate') || query.includes('conference')) eventType = "corporate";
      else if (query.includes('parayanam') || query.includes('chanting')) eventType = "parayanam";

      let estimateRange = "";
      if (eventType === "wedding") {
        estimateRange = "Wedding packages:\n- Basic: ₹3,00,000 – ₹6,00,000\n- Premium: ₹6,00,000 – ₹12,00,000\n- Luxury: ₹12,00,000 – ₹25,00,000+";
      } else if (eventType === "upanayanam" || eventType === "seemantham") {
        estimateRange = "Upanayanam/Seemantham: ₹75,000 – ₹2,00,000 (typically 50-150 guests)";
      } else if (eventType === "sashti") {
        estimateRange = "Sashtiabdapoorthi/Sathabhishekam: ₹1,50,000 – ₹5,00,000 (typically 100-300 guests)";
      } else if (eventType === "corporate") {
        estimateRange = "Corporate Events: ₹1,00,000 – ₹20,00,000+ (based on scale)";
      } else if (eventType === "parayanam") {
        estimateRange = "Veda Parayanam (scholars panel): ₹50,000 – ₹3,00,000 (based on days + priest count)";
      } else {
        estimateRange = "Basic Pooja/Small ceremony: ₹25,000 – ₹75,000 (under 50 guests)";
      }

      const reply = `${estimateRange}${getLocalizedText('pricingGuardrail', userLang)}\n\n${getLocalizedText('pricingNudge', userLang)}`;
      addMessage(reply, 'bot', [
        { label: 'Yes, start booking consultation 📅', value: 'start_booking' },
        { label: 'Traditional Ceremonies 📿', value: 'explain_ceremonies' }
      ]);
      return;
    }

    // Check contact/address trigger words
    if (/\b(contact|phone|number|call|reach|address|office|location|email|mail|where|whatsapp)\b/.test(query)) {
      addMessage(
        "Here are our contact details 📞\n\n📍 **Office:** Lingarajapuram, Bengaluru - 560084\n📞 **Phone / WhatsApp:** +91 9886781380\n📧 **Email:** contact@gsassociates.com\n\nYou can also reach us through this chat — I'm Gowri 🌸, always here to help! Would you like to start a booking consultation? 😊",
        'bot',
        [
          { label: 'Book Consultation 📅', value: 'start_booking' },
          { label: 'Check Auspicious Dates 🌟', value: 'start_muhurtham' }
        ]
      );
      return;
    }

    // Check about company triggers
    if (/\b(who are you|about company|about gs|team|what do you do|founder|directors)\b/.test(query)) {
      addMessage(getLocalizedText('aboutCompany', userLang), 'bot', [
        { label: 'Book Consultation 📅', value: 'start_booking' },
        { label: 'Check Auspicious Dates 🌟', value: 'start_muhurtham' }
      ]);
      return;
    }

    // Off-topic check
    if (/\b(politics|movie|cinema|actor|news|weather|sports|cricket|game|music|song)\b/.test(query)) {
      addMessage(getLocalizedText('offTopic', userLang), 'bot', [
        { label: 'Main Menu', value: 'main_menu' }
      ]);
      return;
    }

    // Check specific ceremonies explanations
    if (query.includes('sashti') || query.includes('60th') || query.includes('shashti')) {
      processOption('info_sashti');
      return;
    }
    if (query.includes('upanayanam') || query.includes('thread') || query.includes('janeu')) {
      processOption('info_upanayanam');
      return;
    }
    if (query.includes('seemantham') || query.includes('shower') || query.includes('pregnancy')) {
      processOption('info_seemantham');
      return;
    }
    if (query.includes('griha') || query.includes('housewarming') || query.includes('house warming')) {
      processOption('info_griha');
      return;
    }
    if (query.includes('parayanam') || query.includes('recitation') || query.includes('chanting')) {
      processOption('info_parayanam');
      return;
    }

    // Fallback Gowri warm reply
    const fallbackText = "Namaskaram 🙏 Thank you for your message. As your coordinator Gowri, I can explain all South Indian ceremonies, give quote ranges, calculate muhurthams, or begin a consultation registration. What would you like to explore next? 🌸";
    addMessage(fallbackText, 'bot', [
      { label: 'Book Consultation 📅', value: 'start_booking' },
      { label: 'Check Auspicious Dates 🌟', value: 'start_muhurtham' },
      { label: 'Traditional Ceremonies 📿', value: 'explain_ceremonies' }
    ]);
  };

  const handleBookingConfirmation = async () => {
    setActiveFlow('none');
    setFlowStep(0);
    const data = flowData;

    try {
      await axios.post('/api/inquiries', {
        name: data.name,
        phone: data.phone,
        event_type: data.event,
        tentative_date: data.date,
        guest_count: parseInt(data.guests) || 100,
        message: `Booking Inquiry Summary via Gowri Chatbot:\n- Package: ${data.package}\n- Add-ons: ${data.addons}\n- Budget: ${data.budget || 'N/A'}\n- City: ${data.city}`
      });
    } catch (err) {
      console.error('Failed to log booking lead:', err.message);
    }

    const successMsg = getLocalizedText('booking_confirm', lang, { name: data.name, phone: data.phone });
    addMessage(successMsg, 'bot', [
      { label: 'Main Menu', value: 'main_menu' }
    ]);
  };

  const triggerEscalation = (reason, userLang) => {
    const timestamp = Date.now().toString().slice(-6);
    setActiveFlow('escalate');
    setFlowStep(1);
    setFlowData({ escalateReason: reason });
    addMessage(getLocalizedText('escalationMsg', userLang, { timestamp }), 'bot');
  };

  const isVipBudget = (text) => {
    const t = text.toLowerCase();
    if (t.includes('lakh') || t.includes('laksh')) {
      const num = parseFloat(t.replace(/[^\d.]/g, ''));
      if (num >= 25) return true;
    }
    const cleanNum = parseInt(t.replace(/[^\d]/g, ''));
    if (cleanNum >= 2500000) return true;
    return false;
  };

  const isVipGuests = (text) => {
    const cleanNum = parseInt(text.replace(/[^\d]/g, ''));
    if (cleanNum >= 1000) return true;
    return false;
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'var(--font-body)' }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glow-gold"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-maroon)',
            color: 'var(--text-light)',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(122, 0, 30, 0.25)'
          }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="animate-slide-up"
          style={{
            width: '360px',
            height: '500px',
            backgroundColor: 'var(--bg-cream)',
            border: '2px solid var(--accent-gold)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(122, 0, 30, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--primary-maroon)',
              color: 'var(--text-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--accent-gold)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent-gold)'
                }}
              >
                <span style={{ fontSize: '20px' }}>🌸</span>
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>Gowri | GS Coordinator</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}>Online | Warm South Indian Service</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#FFFDF9'
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    maxWidth: '85%'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: msg.sender === 'user' ? 'var(--accent-gold-light)' : 'var(--primary-maroon)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {msg.sender === 'user' ? (
                      <User size={14} color="var(--primary-maroon)" />
                    ) : (
                      <Bot size={14} color="var(--text-light)" />
                    )}
                  </div>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-line',
                      backgroundColor: msg.sender === 'user' ? 'var(--primary-maroon)' : 'var(--bg-cream-dark)',
                      color: msg.sender === 'user' ? 'white' : 'var(--text-dark)',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(212,175,55,0.15)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Bubble Quick Options */}
                {msg.options && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      margin: '8px 0 0 36px',
                      maxWidth: '80%'
                    }}
                  >
                    {msg.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionClick(opt.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '15px',
                          border: '1px solid var(--primary-maroon)',
                          backgroundColor: 'white',
                          color: 'var(--primary-maroon)',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-maroon)';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.color = 'var(--primary-maroon)';
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-maroon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot size={14} color="var(--text-light)" />
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    backgroundColor: 'var(--bg-cream-dark)',
                    color: 'var(--text-dark)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Gowri is typing</span>
                  <span className="dot-blink">.</span>
                  <span className="dot-blink" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="dot-blink" style={{ animationDelay: '0.4s' }}>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Text input */}
          <form
            onSubmit={handleSendText}
            style={{
              padding: '12px',
              borderTop: '1px solid var(--accent-gold-light)',
              display: 'flex',
              gap: '8px',
              backgroundColor: 'var(--bg-cream-dark)'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeFlow !== 'none' ? "Type your response here..." : "Ask Gowri about weddings, Muhurthams..."}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '20px',
                border: '1px solid var(--accent-gold)',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            />
            <button
              type="submit"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-maroon)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
