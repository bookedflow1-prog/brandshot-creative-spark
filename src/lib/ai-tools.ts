/** Client-safe catalog of AI product-photo tools. Prompts live here so UI and server agree. */

export type ToolId =
  | "product_scene"
  | "remove_background"
  | "replace_background"
  | "studio_background"
  | "lifestyle_shot"
  | "generate_shadow"
  | "object_eraser"
  | "enhance"
  | "upscale"
  | "variation";

export type ToolDef = {
  id: ToolId;
  label: string;
  description: string;
  credits: number;
  needsPrompt?: boolean;
  promptLabel?: string;
  build: (ctx: { prompt?: string; style?: string; ratio?: string }) => string;
};

const KEEP =
  "Keep the product itself completely unchanged: same shape, colour, materials, logos and text. Photorealistic, commercial advertising quality, sharp focus, correct perspective and realistic lighting. No watermarks, no added text.";

export const STYLES = [
  { id: "clean_studio", label: "Clean Studio", prompt: "a clean seamless studio backdrop with soft diffused key light and gentle falloff" },
  { id: "luxury", label: "Luxury", prompt: "a luxury set with polished stone, deep shadows, warm rim light and elegant reflections" },
  { id: "minimal", label: "Minimal", prompt: "a minimal pastel set with a simple geometric plinth and lots of negative space" },
  { id: "lifestyle", label: "Lifestyle", prompt: "a realistic lifestyle scene where the product is naturally in use, shallow depth of field" },
  { id: "nature", label: "Nature", prompt: "a natural outdoor scene with organic textures, foliage and soft daylight" },
  { id: "premium_dark", label: "Premium Dark", prompt: "a premium dark set with moody gradient lighting and controlled specular highlights" },
  { id: "social_ad", label: "Social Ad", prompt: "a bold, colourful social-ad composition with strong contrast and clear space for a headline" },
  { id: "ecom_white", label: "E-commerce White", prompt: "a pure white e-commerce background with even lighting and a soft contact shadow" },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];

export const RATIOS = [
  { id: "1:1", label: "1:1" },
  { id: "4:5", label: "4:5" },
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
  { id: "3:2", label: "3:2" },
] as const;

const styleText = (id?: string) => STYLES.find((s) => s.id === id)?.prompt ?? STYLES[0].prompt;
const ratioText = (r?: string) => (r ? ` Compose for a ${r} aspect ratio image.` : "");

export const TOOLS: Record<ToolId, ToolDef> = {
  product_scene: {
    id: "product_scene",
    label: "Product Scene",
    description: "Place your product in a professional scene",
    credits: 3,
    build: ({ style, ratio, prompt }) =>
      `Re-photograph this product in ${styleText(style)}.${ratioText(ratio)} ${prompt ? `Art direction: ${prompt}. ` : ""}${KEEP}`,
  },
  remove_background: {
    id: "remove_background",
    label: "Remove Background",
    description: "Isolate the product on a clean cut-out",
    credits: 1,
    build: () => `Remove the background completely and place the product on a pure white background, precise edges including fine details. ${KEEP}`,
  },
  replace_background: {
    id: "replace_background",
    label: "Replace Background",
    description: "Swap the backdrop, keep the product",
    credits: 2,
    needsPrompt: true,
    promptLabel: "Describe the new background",
    build: ({ prompt, ratio }) => `Replace only the background with: ${prompt || "a clean studio backdrop"}. Match lighting and shadows to the new environment.${ratioText(ratio)} ${KEEP}`,
  },
  studio_background: {
    id: "studio_background",
    label: "Studio Background",
    description: "Seamless studio sweep",
    credits: 2,
    build: ({ ratio }) => `Place the product on a seamless professional photography studio sweep with soft gradient lighting and a subtle contact shadow.${ratioText(ratio)} ${KEEP}`,
  },
  lifestyle_shot: {
    id: "lifestyle_shot",
    label: "Lifestyle Shot",
    description: "Product in a real-world setting",
    credits: 3,
    needsPrompt: true,
    promptLabel: "Describe the setting (optional)",
    build: ({ prompt, ratio }) => `Create a lifestyle product photograph: ${prompt || "the product used naturally in an aspirational everyday setting"}. Shallow depth of field, natural light.${ratioText(ratio)} ${KEEP}`,
  },
  generate_shadow: {
    id: "generate_shadow",
    label: "Generate Shadow",
    description: "Add a realistic contact shadow",
    credits: 1,
    build: () => `Add a realistic, physically correct contact shadow and soft ambient occlusion under the product, keeping the existing background. ${KEEP}`,
  },
  object_eraser: {
    id: "object_eraser",
    label: "Object Eraser",
    description: "Remove unwanted objects",
    credits: 2,
    needsPrompt: true,
    promptLabel: "What should be removed?",
    build: ({ prompt }) => `Remove ${prompt || "the unwanted object"} from the image and reconstruct the area behind it seamlessly. ${KEEP}`,
  },
  enhance: {
    id: "enhance",
    label: "Enhance",
    description: "Colour, clarity and lighting cleanup",
    credits: 1,
    build: () => `Enhance this product photograph: correct white balance, increase clarity and dynamic range, clean up noise and dust. Do not restyle it. ${KEEP}`,
  },
  upscale: {
    id: "upscale",
    label: "Upscale",
    description: "Higher-resolution rendition",
    credits: 2,
    build: () => `Re-render this product photograph at maximum detail and resolution, recovering fine texture and crisp edges without altering composition. ${KEEP}`,
  },
  variation: {
    id: "variation",
    label: "Variation",
    description: "Another take on the same shot",
    credits: 2,
    build: ({ prompt }) => `Create an alternative version of this product photograph with a different camera angle and lighting setup${prompt ? `, art direction: ${prompt}` : ""}. ${KEEP}`,
  },
};

export const TOOL_LIST = Object.values(TOOLS);
