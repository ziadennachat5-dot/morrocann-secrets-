import { readdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { Database, Json } from "../src/integrations/supabase/types";

const descriptions: Record<string, { en: string; fr: string; ar: string }> = {
  "1.jpeg": {
    en: "A Moroccan sitting room with patterned tile walls, sofas, a chandelier, and a low table.",
    fr: "Un salon marocain avec des murs en zellige, des banquettes, un lustre et une table basse.",
    ar: "غرفة جلوس مغربية بجدران من الزليج ومقاعد وثريا وطاولة منخفضة.",
  },
  "2.jpeg": {
    en: "A close view of embroidered purple clothing above a patterned rug.",
    fr: "Gros plan sur un vêtement violet brodé au-dessus d'un tapis à motifs.",
    ar: "لقطة قريبة لملابس أرجوانية مطرزة فوق سجادة مزخرفة.",
  },
  "3.jpeg": {
    en: "Two people seated beside a shared meal in a tile-decorated sitting room.",
    fr: "Deux personnes assises près d'un repas partagé dans un salon décoré de zelliges.",
    ar: "شخصان يجلسان بجوار وجبة مشتركة في غرفة مزينة بالزليج.",
  },
  "4.jpeg": {
    en: "A guest wearing a purple embroidered outfit in a Moroccan sitting room.",
    fr: "Une invitée portant une tenue violette brodée dans un salon marocain.",
    ar: "ضيفة ترتدي لباسًا أرجوانيًا مطرزًا في غرفة جلوس مغربية.",
  },
  "5.jpeg": {
    en: "A shared platter of couscous, vegetables, and chicken on a decorated table.",
    fr: "Un plat partagé de couscous, de légumes et de poulet sur une table décorée.",
    ar: "طبق مشترك من الكسكس والخضروات والدجاج على مائدة مزخرفة.",
  },
  "6.jpeg": {
    en: "A person pours tea beside a table of food in a tiled sitting room.",
    fr: "Une personne sert du thé près d'une table garnie dans un salon aux murs de zellige.",
    ar: "شخص يسكب الشاي بجوار مائدة طعام في غرفة مزينة بالزليج.",
  },
  "7.jpeg": {
    en: "Two people prepare tea together beside a traditional teapot.",
    fr: "Deux personnes préparent le thé ensemble près d'une théière traditionnelle.",
    ar: "شخصان يحضّران الشاي معًا بجوار إبريق تقليدي.",
  },
  "8.jpeg": {
    en: "Two people seated at a table with shared dishes in a patterned room.",
    fr: "Deux personnes assises à une table avec des plats à partager dans une pièce décorée.",
    ar: "شخصان يجلسان إلى مائدة عليها أطباق مشتركة في غرفة مزخرفة.",
  },
  "9.jpeg": {
    en: "Three people seated together at a table with shared dishes.",
    fr: "Trois personnes réunies autour d'une table avec des plats à partager.",
    ar: "ثلاثة أشخاص يجلسون معًا حول مائدة عليها أطباق مشتركة.",
  },
  "10.jpeg": {
    en: "A group of people standing together in a Moroccan sitting room.",
    fr: "Un groupe de personnes réunies dans un salon marocain.",
    ar: "مجموعة من الأشخاص مجتمعون في غرفة جلوس مغربية.",
  },
  "11.jpeg": {
    en: "People seated around a table with shared dishes in a Moroccan sitting room.",
    fr: "Des personnes assises autour d'une table avec des plats à partager dans un salon marocain.",
    ar: "أشخاص يجلسون حول مائدة عليها أطباق مشتركة في غرفة جلوس مغربية.",
  },
  "12.jpeg": {
    en: "A group of people gathered around a table with shared dishes.",
    fr: "Un groupe de personnes réunies autour d'une table avec des plats à partager.",
    ar: "مجموعة من الأشخاص مجتمعون حول مائدة عليها أطباق مشتركة.",
  },
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function main() {
  const supabase = createClient<Database>(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const root = process.cwd();
  const allFiles = await readdir(root);
  const ignoredFiles = new Set([
    "RIAD.png",
    "apple-touch-icon.png",
    "favicon.ico",
    "favicon-32x32.png",
    "og-image.png",
  ]);
  const sources = allFiles
    .filter((filename) => /\.(jpe?g|png|webp)$/i.test(filename) && !ignoredFiles.has(filename))
    .sort((left, right) => {
      const leftNum = Number.parseInt(left, 10);
      const rightNum = Number.parseInt(right, 10);
      if (!Number.isNaN(leftNum) && !Number.isNaN(rightNum)) return leftNum - rightNum;
      return left.localeCompare(right);
    });

  let nextSortOrder = 100;
  for (const sourceFile of sources) {
    const alt = descriptions[sourceFile] ?? {
      en: `Moroccan dining photo (${path.parse(sourceFile).name})`,
      fr: `Photo de repas marocain (${path.parse(sourceFile).name})`,
      ar: `صورة عشاء مغربي (${path.parse(sourceFile).name})`,
    };
    const existing = await supabase
      .from("guest_photos")
      .select("id")
      .eq("source_file", sourceFile)
      .maybeSingle();
    if (existing.error) throw new Error(`Unable to check ${sourceFile}: ${existing.error.message}`);
    if (existing.data) {
      console.log(`Skipped ${sourceFile}: already seeded.`);
      continue;
    }

    const inputPath = path.join(root, sourceFile);
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width) throw new Error(`Unable to read image dimensions for ${sourceFile}.`);
    const orientationSwapsAxes = [5, 6, 7, 8].includes(metadata.orientation ?? 0);
    const sourceWidth = orientationSwapsAxes ? metadata.height : metadata.width;
    if (!sourceWidth) throw new Error(`Unable to determine oriented width for ${sourceFile}.`);
    const widths = [
      ...new Set([320, 640, 960, 1200, 1600].filter((width) => width <= sourceWidth)),
    ];
    widths.push(sourceWidth);
    const safeBaseName = path.parse(sourceFile).name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileKey = `seed/${safeBaseName}`;
    const renditions: { width: number; path: string }[] = [];
    for (const width of [...new Set(widths)].sort((a, b) => a - b)) {
      const optimized = await sharp(inputPath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();
      const actualWidth = (await sharp(optimized).metadata()).width;
      if (!actualWidth) throw new Error(`Could not read optimized width for ${sourceFile}.`);
      const objectPath = `${fileKey}/${actualWidth}.webp`;
      const upload = await supabase.storage
        .from("guest-photos")
        .upload(objectPath, optimized, { contentType: "image/webp", upsert: true });
      if (upload.error) {
        if (renditions.length) {
          await supabase.storage
            .from("guest-photos")
            .remove(renditions.map(({ path: itemPath }) => itemPath));
        }
        throw new Error(`Unable to upload ${sourceFile}: ${upload.error.message}`);
      }
      renditions.push({ width: actualWidth, path: objectPath });
    }

    const largest = renditions.at(-1);
    if (!largest) throw new Error(`No optimized renditions were created for ${sourceFile}.`);
    const renditionJson: Json[] = renditions.map(({ width, path: itemPath }) => ({
      width,
      path: itemPath,
    }));
    const num = Number.parseInt(sourceFile, 10);
    const calculatedSortOrder = !Number.isNaN(num) ? num - 1 : nextSortOrder++;
    const insert = await supabase.from("guest_photos").insert({
      source_file: sourceFile,
      storage_path: largest.path,
      renditions: renditionJson,
      alt,
      sort_order: calculatedSortOrder,
      guest_consent_confirmed: false,
    });
    if (insert.error) {
      await supabase.storage
        .from("guest-photos")
        .remove(renditions.map(({ path: itemPath }) => itemPath));
      throw new Error(`Unable to save photo metadata for ${sourceFile}: ${insert.error.message}`);
    }
    console.log(`Seeded ${sourceFile} as private WebP renditions; consent remains unchecked.`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Guest photo seeding failed.");
  process.exitCode = 1;
});
