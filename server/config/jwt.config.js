// server/config/jwt.config.js

// FOR DEBUGGING PURPOSES ONLY - DO NOT USE HARDCODED SECRETS IN PRODUCTION
// Replace this with your actual strong secret key
const JWT_SECRET_HARDCODED = "a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f83453uh453";
const JWT_EXPIRES_IN_HARDCODED = "7d"; // Or "1h", "30m"

if (JWT_SECRET_HARDCODED === "YourSuperLongAndVerySecretKeyShouldGoHere_AtLeast32Characters_ChangeThis" || JWT_SECRET_HARDCODED.length < 32) {
    console.warn(
        "\n*********************************************************************************\n".yellow +
        "WARNING: Using a placeholder or short hardcoded JWT_SECRET in jwt.config.js!".yellow.bold +
        "\nREPLACE THIS WITH YOUR ACTUAL STRONG SECRET FOR TESTING.".yellow.bold +
        "\nDO NOT COMMIT THIS TO VERSION CONTROL WITH A WEAK OR PLACEHOLDER SECRET.".yellow.bold +
        "\n*********************************************************************************\n".yellow
    );
}

console.log("JWT Config: Using HARDCODED JWT_SECRET from jwt.config.js".magenta.bold);
console.log("JWT Config: Using HARDCODED JWT_EXPIRES_IN from jwt.config.js:".magenta.bold, JWT_EXPIRES_IN_HARDCODED);

export const jwtConfig = {
  secret: JWT_SECRET_HARDCODED,
  expiresIn: JWT_EXPIRES_IN_HARDCODED,
};