import AccountSettingsSection from './AccountSettingsSection'
import PersonalInfoSection from './PersonalInfoSection'

type ProfileTabContentProps = {
  user: any
}

export default function ProfileTabContent({ user }: ProfileTabContentProps) {
  return (
    <div className="space-y-8">
      <PersonalInfoSection user={user} />
      <AccountSettingsSection user={user} />
    </div>
  )
}
