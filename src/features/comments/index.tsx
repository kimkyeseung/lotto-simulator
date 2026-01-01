import { ContentSection } from '../settings/components/content-section'
import { CommentList } from './components'

export function SettingsComments() {
  return (
    <ContentSection
      title='Comments'
      desc='커뮤니티 댓글을 확인하고 참여하세요.'
    >
      <CommentList />
    </ContentSection>
  )
}

export { CommentList } from './components'
export { LikeButton } from './components'
export * from './hooks'
export * from './types'
