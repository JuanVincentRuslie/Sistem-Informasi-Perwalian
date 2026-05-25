/**
 * CLI parser jadwal Excel.
 * Template TA (custom) — 3 sheet wajib: "Jadwal Kelas", "Jadwal UTS", "Jadwal UAS".
 *
 * Usage:
 *   node parse-jadwal.js --input <file.xlsx> --output <file.json> --periode-id <id>
 */
const path = require("node:path");
const { parseJadwal } = require("../../backend/src/services/jadwalExcelParser");

const DEFAULT_OUTPUT = "jadwal.json";

function parseArgs(argv) {
  const args = { output: DEFAULT_OUTPUT, periodeId: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      if (!args.input) args.input = arg;
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = inlineValue ?? argv[i + 1];
    if (inlineValue === undefined) i += 1;

    if (key === "periodeId") {
      args.periodeId = value == null ? null : Number(value);
      continue;
    }

    args[key] = value;
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node parse-jadwal.js --input <file.xlsx> --output <file.json> --periode-id <id>

Options:
  --input       Path file Excel jadwal
  --output      Path output JSON, default: ${DEFAULT_OUTPUT}
  --periode-id  ID periode dari tabel periode

Example:
  node parse-jadwal.js --input Template_jadwal_kelas.xlsx --output jadwal.json --periode-id 1
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (!args.input) {
    throw new Error("Argumen --input wajib diisi.");
  }

  const result = await parseJadwal({
    input: args.input,
    output: args.output,
    periodeId: args.periodeId,
  });

  console.log(
    `OK: ${result.metadata.total_kelas} kelas, ${result.metadata.total_sesi} sesi, ${result.metadata.total_ujian} ujian`,
  );
  console.log(`Output: ${path.resolve(args.output)}`);

  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.length}`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
