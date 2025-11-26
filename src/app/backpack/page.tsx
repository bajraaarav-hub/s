import {BackpackChecker} from '@/components/backpack-checker';
import {homeworkSheet, backpackSheet, mainStudent} from '@/lib/data';
import type {Homework} from '@/lib/types';

export default function BackpackPage() {
  // Process the "Excel-like" data into the format the component expects
  const allHomework: Homework[] = homeworkSheet.map(row => ({
    id: row[0],
    title: row[1],
    requiredBooks: row.slice(2),
  }));

  const initialBackpackContents: string[] = backpackSheet.map(row => row[0]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Smart Book Check</h1>
        <p className="text-muted-foreground">Verify you have all the books you need for your homework, powered by AI.</p>
      </div>
      <BackpackChecker
        student={mainStudent}
        allHomework={allHomework}
        initialBackpackContents={initialBackpackContents}
      />
    </div>
  );
}
