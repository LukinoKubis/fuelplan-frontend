import { usePlan } from '../state/PlanContext'
import { ShoppingList } from '../components/fuel/ShoppingList'

export function HaulSection() {
  const { plan } = usePlan()
  return <ShoppingList categories={plan?.shopping_list || []} />
}
