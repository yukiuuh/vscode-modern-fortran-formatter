export const formatWarningMessage = (
  filePath: string,
  fullWarningMessage: string
): string => {
  if (!fullWarningMessage) {
    return "";
  }

  const regExpResult = fullWarningMessage.split(
    /([A-Z]{4,}): File -, line ([0-9]+)\s+/
  );

  let warningMessages: string[] = [];
  regExpResult?.forEach((str, i) => {
    if (i === 0) {
      return;
    } else if (i % 3 === 0) {
      const logLevel = regExpResult[i - 2];
      const lineNumber = regExpResult[i - 1];
      warningMessages.push(
        "\t" + logLevel + ": " + filePath + ":" + lineNumber + " \n\t\t" + str
      );
    }
  });

  return warningMessages.join("\n");
};
