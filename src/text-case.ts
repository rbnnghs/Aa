import { Clipboard, showHUD, getSelectedText } from "@raycast/api";

function detectCasePattern(text: string): "upper" | "lower" | "title" | "mixed" | "empty" {
  if (!text || text.trim().length === 0) return "empty";

  const hasUpper = /[A-Z]/.test(text);
  const hasLower = /[a-z]/.test(text);

  if (hasUpper && !hasLower) return "upper";
  if (hasLower && !hasUpper) return "lower";

  if (isTitleCase(text)) return "title";

  return "mixed";
}

function isTitleCase(text: string): boolean {
  const words = text.split(/\s+/);
  return words.every((word) => {
    if (word.length === 0) return true;
    return word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();
  });
}

function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function transformCase(text: string): string {
  if (!text) return text;

  const pattern = detectCasePattern(text);

  switch (pattern) {
    case "lower":
      return text.toUpperCase();

    case "upper":
      return toTitleCase(text);

    case "title":
      return text.toLowerCase();

    case "mixed":
      return text.toLowerCase();

    default:
      return text;
  }
}

async function getSelectedTextSafely(): Promise<string> {
  try {
    return await getSelectedText();
  } catch {
    return (await Clipboard.readText()) || "";
  }
}

async function replaceText(text: string): Promise<void> {
  await Clipboard.copy(text);
  await new Promise((resolve) => setTimeout(resolve, 50));
  await Clipboard.paste(text);
}

export default async function Command() {
  try {
    const selectedText = await getSelectedTextSafely();

    if (!selectedText || selectedText.trim().length === 0) {
      await showHUD("❌ No text selected");
      return;
    }

    const transformedText = transformCase(selectedText);
    await replaceText(transformedText);

    const caseType = detectCasePattern(transformedText);
    const caseLabels: Record<string, string> = {
      upper: "UPPERCASE",
      lower: "lowercase",
      title: "Title Case",
      mixed: "Mixed Case",
      empty: "Empty",
    };

    await showHUD(caseLabels[caseType] || "Transformed");
  } catch (error) {
    console.error("Error transforming text:", error);
    await showHUD("❌ Failed to transform text");
  }
}
