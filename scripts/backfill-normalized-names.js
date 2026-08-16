// Usage:
//   node scripts/backfill-normalized-names.js [--dry-run]
//
// Populates GymExercise.normalizedName for rows that don't have it yet.
// Must match lib/gym/exerciseName.ts::normalizeExerciseName exactly.
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function normalizeExerciseName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const batchSize = 500
  let skip = 0
  let updated = 0
  let failed = 0

  while (true) {
    const rows = await prisma.gymExercise.findMany({
      where: { normalizedName: null },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
      take: batchSize,
      skip,
    })
    if (rows.length === 0) break

    for (const row of rows) {
      const normalizedName = normalizeExerciseName(row.name)
      if (dryRun) {
        console.log(`${row.id} -> "${normalizedName}"`)
        continue
      }
      try {
        await prisma.gymExercise.update({ where: { id: row.id }, data: { normalizedName } })
        updated++
      } catch (e) {
        failed++
        console.error(`Failed to update exercise ${row.id}: ${e.message}`)
      }
    }

    skip += rows.length
  }

  if (!dryRun) {
    console.log(`Backfill complete. Updated: ${updated}, failed: ${failed}`)
  }
}

main()
  .catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
