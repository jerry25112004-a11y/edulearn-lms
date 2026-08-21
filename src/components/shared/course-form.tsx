"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createCourseAction, updateCourseAction } from "@/actions/courses";
import type { ActionState } from "@/actions/auth";

const initial: ActionState = { success: false };

type CourseFormValues = {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  instructorId?: string;
  level: string;
  duration: string;
  objectives: string[];
  requirements: string[];
  thumbnailUrl?: string | null;
  status: string;
};

export function CourseForm({
  mode,
  course,
  categories,
  instructors,
  showInstructorSelect,
  redirectPath,
}: {
  mode: "create" | "edit";
  course?: CourseFormValues;
  categories: { id: string; name: string }[];
  instructors?: { id: string; name: string }[];
  showInstructorSelect: boolean;
  redirectPath: string;
}) {
  const router = useRouter();
  const action = mode === "create" ? createCourseAction : updateCourseAction;
  const [state, formAction, pending] = useActionState(action, initial);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      if (mode === "edit") {
        router.push(redirectPath);
      }
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-6">
      {course?.id && <input type="hidden" name="id" value={course.id} />}
      {mode === "create" && <input type="hidden" name="redirectTo" value={redirectPath} />}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" defaultValue={course?.title} required placeholder="e.g. Full Stack Web Development" />
            <FieldError messages={state.errors?.title} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={course?.description} rows={4} required placeholder="What will students learn in this course?" />
            <FieldError messages={state.errors?.description} />
          </div>
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
            <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={course?.thumbnailUrl ?? ""} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select id="categoryId" name="categoryId" defaultValue={course?.categoryId} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              <FieldError messages={state.errors?.categoryId} />
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select id="level" name="level" defaultValue={course?.level ?? "BEGINNER"} required>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" defaultValue={course?.duration} required placeholder="e.g. 8 weeks" />
              <FieldError messages={state.errors?.duration} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={course?.status ?? "DRAFT"}>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option>
              </Select>
            </div>
            {showInstructorSelect && (
              <div className="sm:col-span-2">
                <Label htmlFor="instructorId">Instructor</Label>
                <Select id="instructorId" name="instructorId" defaultValue={course?.instructorId} required>
                  <option value="">Select instructor</option>
                  {instructors?.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </Select>
                <FieldError messages={state.errors?.instructorId} />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="objectives">Learning Objectives (one per line)</Label>
            <Textarea
              id="objectives"
              name="objectives"
              rows={4}
              defaultValue={course?.objectives?.join("\n")}
              placeholder={"Build responsive websites\nUnderstand REST APIs\n..."}
            />
          </div>
          <div>
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              rows={3}
              defaultValue={course?.requirements?.join("\n")}
              placeholder={"Basic computer skills\nA laptop with internet access\n..."}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" loading={pending}>
          {mode === "create" ? "Create Course" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
