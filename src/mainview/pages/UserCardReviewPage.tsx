import type { Course } from '../../bun/types';
import CourseSwitcher from '../components/CourseSwitcher';
import PageContent from '../layouts/PageContent';
import PageHeader from '../layouts/PageHeader';
import PageLayout from '../layouts/PageLayout';
import UserCardReviewSection from '../sections/UserCardReviewSection';

interface UserCardReviewPageProps {
  courseId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}

export default function UserCardReviewPage({
  courseId,
  onBack,
  onSwitchCourse,
}: UserCardReviewPageProps) {
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <UserCardReviewSection courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}
