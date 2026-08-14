// Usage:
//   node scripts/reset-password.js list
//   node scripts/reset-password.js reset <email> <newPassword>
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const [cmd, a, b] = process.argv.slice(2)

  if (cmd === 'list') {
    const users = await prisma.user.findMany({ select: { id: true, email: true, createdAt: true } })
    console.log(users)
    return
  }

  if (cmd === 'reset') {
    const [email, newPassword] = [a, b]
    if (!email || !newPassword) {
      console.error('Usage: node scripts/reset-password.js reset <email> <newPassword>')
      process.exit(1)
    }
    const hash = await bcrypt.hash(newPassword, 10)
    const user = await prisma.user.update({
      where: { email },
      data: { password: hash },
    })
    console.log(`Password reset for ${user.email}`)
    return
  }

  console.error('Usage:\n  node scripts/reset-password.js list\n  node scripts/reset-password.js reset <email> <newPassword>')
}

main()
  .catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
