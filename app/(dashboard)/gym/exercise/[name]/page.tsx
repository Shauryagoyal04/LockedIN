import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getExerciseHistory } from '@/lib/gym/exerciseHistory'
import ExerciseHistoryView from '@/components/gym/ExerciseHistoryView'

export default async function ExerciseHistoryPage({ params }: { params: { name: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }
  const userId = parseInt(session.user.id)

  const normalizedName = decodeURIComponent(params.name)
  const history = await getExerciseHistory(userId, normalizedName)

  if (!history) {
    redirect('/gym')
  }

  return <ExerciseHistoryView history={history} />
}
