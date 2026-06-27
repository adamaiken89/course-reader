import type { Course } from '../../bun/types';
import CourseSwitcher from '../components/CourseSwitcher';
import PageContent from '../layouts/PageContent';
import PageHeader from '../layouts/PageHeader';
import PageLayout from '../layouts/PageLayout';
import ReviewSection from '../sections/ReviewSection';

interface ReviewPageProps {
  courseId: string;
  onBack: () => void;
  onSwitchCourse: (course: Course) => void;
}

export default function ReviewPage({ courseId, onBack, onSwitchCourse }: ReviewPageProps) {
  return (
    <PageLayout>
      <PageHeader
        onBack={onBack}
        center={<CourseSwitcher currentCourseId={courseId} onSelect={onSwitchCourse} />}
      />
      <PageContent>
        <ReviewSection courseId={courseId} />
      </PageContent>
    </PageLayout>
  );
}
