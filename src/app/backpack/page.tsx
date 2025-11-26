import {BackpackChecker} from '@/components/backpack-checker';
import {homeworkAssignments, currentBackpackContents, mainStudent} from '@/lib/data';

export default function BackpackPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Smart Book Check</h1>
        <p className="text-muted-foreground">Verify you have all the books you need for your homework, powered by AI.</p>
      </div>
      <BackpackChecker
        student={mainStudent}
        allHomework={homeworkAssignments}
        initialBackpackContents={currentBackpackContents}
      />
    </div>
  );
}
