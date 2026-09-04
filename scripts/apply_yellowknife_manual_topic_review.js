import fs from 'node:fs';

const path = 'public/data/yellowknife/motions.json';

// Every change below was decided by reading the individual title against
// docs/CATEGORIZATION_GUIDE.md. This is an explicit review record, not a
// keyword classifier.
const changes = {
  'yk-2022-12-12-0178-22': 'Governance',
  'yk-2023-01-09-0005-23': 'General',
  'yk-2023-01-09-0006-23': 'General',
  'yk-2023-01-23-00010-23': 'General',
  'yk-2023-01-23-0009-23': 'General',
  'yk-2023-01-23-0011-23': 'General',
  'yk-2023-02-13-0022-23': 'Finance',
  'yk-2023-02-27-0028-23': 'General',
  'yk-2023-04-11-0056-23': 'General',
  'yk-2023-04-24-0064-23': 'General',
  'yk-2023-05-08-0075-23': 'General',
  'yk-2023-05-23-0086-23': 'Finance',
  'yk-2023-07-24-00104-23': 'General',
  'yk-2023-09-25-0119-23': 'Governance',
  'yk-2023-06-12-0058-17': 'Finance',
  'yk-2023-10-23-0128-23': 'General',
  'yk-2023-10-30-0133-23': 'Finance',
  'yk-2023-12-11-0149-23': 'General',
  'yk-2023-12-11-0150-23': 'General',
  'yk-2023-12-11-0151-23': 'General',
  'yk-2023-12-11-0152-23': 'General',
  'yk-2024-01-22-0006-24': 'General',
  'yk-2024-01-22-0007-24': 'General',
  'yk-2024-04-22-0085-24': 'General',
  'yk-2024-04-22-0086-24': 'General',
  'yk-2024-04-22-0087-24': 'General',
  'yk-2024-05-13-0094-24': 'Finance',
  'yk-2024-06-24-0129-24': 'General',
  'yk-2024-07-08-0132-24': 'Governance',
  'yk-2024-08-26-0143-24': 'Public Safety',
  'yk-2024-09-23-0165-24': 'Parks',
  'yk-2024-09-23-0166-24': 'Public Safety',
  'yk-2024-10-15-0183-24': 'General',
  'yk-2024-10-15-0184-24': 'Transit',
  'yk-2025-03-24-0054-25': 'Finance',
  'yk-2025-05-12-0084-25': 'General',
  'yk-2025-06-09-0111-25': 'General',
  'yk-2025-06-09-0117-25': 'Public Safety',
  'yk-2025-07-28-0139-25': 'Governance',
  'yk-2025-07-28-0137-25': 'Finance',
  'yk-2025-09-08-0160-25': 'Governance',
  'yk-2025-09-22-0182-25': 'Finance',
  'yk-2025-10-27-0195-25': 'General',
  'yk-2025-10-27-0196-25': 'General',
  'yk-2025-10-27-0197-25': 'General',
  'yk-2025-10-27-0198-25': 'General',
  'yk-2025-10-27-0199-25': 'General',
  'yk-2025-10-27-0200-25': 'General',
  'yk-2025-10-27-0201-25': 'Finance',
  'yk-2025-11-24-0216-25': 'General',
  'yk-2025-11-24-0217-25': 'General',
  'yk-2025-12-01-0365-93': 'Governance',
  'yk-2025-12-08-0224-25': 'Climate',
  'yk-2025-12-08-0227-25': 'Finance',
  'yk-2026-01-12-0002-26': 'Governance',
  'yk-2026-01-26-0009-26': 'General',
  'yk-2026-02-25-0029-26': 'Climate',
  'yk-2026-03-18-0053-26': 'General',
  'yk-2026-03-25-0061-26': 'Finance',
  'yk-2026-03-25-0069-26': 'General',
  'yk-2026-04-22-0081-26': 'General',
};

const motions = JSON.parse(fs.readFileSync(path, 'utf8'));
const byId = new Map(motions.map(motion => [motion.id, motion]));
for (const [id, topic] of Object.entries(changes)) {
  const motion = byId.get(id);
  if (!motion) throw new Error(`Missing Yellowknife motion ${id}`);
  motion.topic = topic;
}
fs.writeFileSync(path, JSON.stringify(motions, null, 2));
console.log(`Applied ${Object.keys(changes).length} manually reviewed topic changes.`);
