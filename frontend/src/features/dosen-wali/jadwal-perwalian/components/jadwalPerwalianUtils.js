const HARI_OPTIONS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const BULAN_OPTIONS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const BULAN_INDEX_BY_NAME = Object.fromEntries(
  BULAN_OPTIONS.map((bulan, index) => [bulan.toLowerCase(), index + 1])
);

const HARI_INDEX = Object.fromEntries(HARI_OPTIONS.map((hari, index) => [hari, index]));

let nextSlotId = 1;

function generateSlotId() {
  const slotId = nextSlotId;
  nextSlotId += 1;
  return slotId;
}

function normalizeHari(value) {
  if (!value) return '';

  const normalized = value.trim().toLowerCase();
  return HARI_OPTIONS.find((hari) => hari.toLowerCase() === normalized) ?? '';
}

export function createEmptyJadwalSlot() {
  return {
    id: generateSlotId(),
    tanggal: '',
    hari: '',
    jamMulaiJam: '',
    jamMulaiMenit: '',
    jamSelesaiJam: '',
    jamSelesaiMenit: '',
  };
}

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function formatTanggalIso(year, month, day) {
  return `${year}-${padDatePart(month)}-${padDatePart(day)}`;
}

function parseTanggalLabel(day, monthName, year) {
  const month = BULAN_INDEX_BY_NAME[monthName.toLowerCase()];

  if (!month) return '';

  return formatTanggalIso(year, month, day);
}

export function getHariFromTanggal(tanggal) {
  if (!tanggal) return '';

  const [year, month, day] = tanggal.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return HARI_OPTIONS[date.getDay()] ?? '';
}

export function formatTanggalSlot(tanggal) {
  if (!tanggal) return '';

  const [year, month, day] = tanggal.split('-').map(Number);
  const hari = getHariFromTanggal(tanggal);
  return `${hari} ${day} ${BULAN_OPTIONS[month - 1]} ${year}`;
}

function splitTimeParts(timeValue) {
  if (!timeValue) {
    return { hour: '', minute: '' };
  }

  const [hour = '', minute = ''] = timeValue.split(':');
  return { hour, minute };
}

function joinTimeParts(hour, minute) {
  if (!hour || !minute) return '';
  return `${hour}:${minute}`;
}

function getJamMulai(slot) {
  return joinTimeParts(slot.jamMulaiJam, slot.jamMulaiMenit);
}

function getJamSelesai(slot) {
  return joinTimeParts(slot.jamSelesaiJam, slot.jamSelesaiMenit);
}

export function parseJadwalPerwalian(jadwalPerwalian) {
  if (!jadwalPerwalian?.trim()) return [];

  return jadwalPerwalian
    .split(',')
    .map((item) => item.trim())
    .map((item) => {
      const datedMatch = item.match(
        /^(.+?)\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/
      );

      if (datedMatch) {
        const tanggal = parseTanggalLabel(datedMatch[2], datedMatch[3], datedMatch[4]);
        const jamMulai = splitTimeParts(datedMatch[5]);
        const jamSelesai = splitTimeParts(datedMatch[6]);

        return {
          id: generateSlotId(),
          tanggal,
          hari: getHariFromTanggal(tanggal),
          jamMulaiJam: jamMulai.hour,
          jamMulaiMenit: jamMulai.minute,
          jamSelesaiJam: jamSelesai.hour,
          jamSelesaiMenit: jamSelesai.minute,
        };
      }

      const match = item.match(/^(.+?)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);

      if (!match) return null;

      const hari = normalizeHari(match[1]);
      if (!hari) return null;
      const jamMulai = splitTimeParts(match[2]);
      const jamSelesai = splitTimeParts(match[3]);

      return {
        id: generateSlotId(),
        tanggal: '',
        hari,
        jamMulaiJam: jamMulai.hour,
        jamMulaiMenit: jamMulai.minute,
        jamSelesaiJam: jamSelesai.hour,
        jamSelesaiMenit: jamSelesai.minute,
      };
    })
    .filter(Boolean);
}

export function validateJadwalSlots(slots) {
  const hasPartialRow = slots.some((slot) => {
    const values = [
      slot.tanggal,
      slot.jamMulaiJam,
      slot.jamMulaiMenit,
      slot.jamSelesaiJam,
      slot.jamSelesaiMenit,
    ];
    const filledCount = values.filter(Boolean).length;
    return filledCount > 0 && filledCount < values.length;
  });

  if (hasPartialRow) {
    return 'Lengkapi tanggal, jam mulai, dan jam selesai pada setiap baris yang terisi.';
  }

  const filledSlots = slots.filter((slot) => (
    slot.tanggal
    && slot.jamMulaiJam
    && slot.jamMulaiMenit
    && slot.jamSelesaiJam
    && slot.jamSelesaiMenit
  ));
  const invalidTimeRange = filledSlots.some((slot) => getJamMulai(slot) >= getJamSelesai(slot));

  if (invalidTimeRange) {
    return 'Jam selesai harus lebih besar daripada jam mulai.';
  }

  const duplicateKeySet = new Set();
  const hasDuplicate = filledSlots.some((slot) => {
    const key = `${slot.tanggal}-${getJamMulai(slot)}-${getJamSelesai(slot)}`;

    if (duplicateKeySet.has(key)) {
      return true;
    }

    duplicateKeySet.add(key);
    return false;
  });

  if (hasDuplicate) {
    return 'Ada slot jadwal yang sama persis. Hapus duplikasi sebelum menyimpan.';
  }

  return null;
}

export function serializeJadwalPerwalian(slots) {
  const filledSlots = slots
    .filter((slot) => (
      slot.tanggal
      && slot.jamMulaiJam
      && slot.jamMulaiMenit
      && slot.jamSelesaiJam
      && slot.jamSelesaiMenit
    ))
    .sort((left, right) => {
      const tanggalDiff = left.tanggal.localeCompare(right.tanggal);
      if (tanggalDiff !== 0) return tanggalDiff;
      return getJamMulai(left).localeCompare(getJamMulai(right));
    });

  if (filledSlots.length === 0) return null;

  return filledSlots
    .map((slot) => `${formatTanggalSlot(slot.tanggal)} ${getJamMulai(slot)} - ${getJamSelesai(slot)}`)
    .join(', ');
}

export function splitJadwalPerwalianLines(jadwalPerwalian) {
  if (!jadwalPerwalian?.trim()) return [];

  return jadwalPerwalian
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export { HARI_OPTIONS, HOUR_OPTIONS, MINUTE_OPTIONS };
