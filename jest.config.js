module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/tests/**/*.test.(ts|js)", "**/?(*.)+(spec|test).(ts|js)"],
};
