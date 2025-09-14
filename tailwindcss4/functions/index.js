const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const codeValidation = {
  vb: /^dim\s+mana\s+as\s+integer\s*=\s*50$/i,
  python: /^mana\s*=\s*50$/i,
  java: /^int\s+mana\s*=\s*50;$/i,
};

exports.validateCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return { valid: false, message: "❌ You must be logged in.", xp: 0 };
  }

  const uid = context.auth.uid;
  const { code, language } = data;

  if (!code || !language) {
    return { valid: false, message: "⚠️ Code or language not provided.", xp: 0 };
  }

  const regex = codeValidation[language.toLowerCase()];
  if (!regex) {
    return { valid: false, message: "⚠️ Unsupported language.", xp: 0 };
  }

  const isValid = regex.test(code.trim());
  if (!isValid) {
    return { valid: false, message: "❌ Try again! Hint: Use a variable like Mana.", xp: 0 };
  }

  const xpEarned = 50;
  const userRef = db.collection("users").doc(uid);

  await userRef.set(
    {
      xp: admin.firestore.FieldValue.increment(xpEarned),
      "progress.chapter1": true, // <-- safer merge
    },
    { merge: true }
  );

  return {
    valid: true,
    message: "✨ Correct! The chest opens. ✨",
    xp: xpEarned,
  };
});





