"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

type Course = {
  id: number
  name: string
  seatsAvailable: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    apiFetch<Course[]>("/courses")
        .then(data => setCourses(data))
        .catch(err => setError("Error fetching courses"))

  }, [])

  async function register(courseId: number) {
    try {
      await apiFetch(`/courses/${courseId}/register`, {
        method: "POST",
      })
      setCourses(courses =>
        courses.map(c =>
          c.id === courseId
            ? { ...c, seatsAvailable: c.seatsAvailable - 1 }
            : c
        )
      )
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Courses</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Seats left: {course.seatsAvailable}</p>
              <Button
                disabled={course.seatsAvailable === 0}
                onClick={() => register(course.id)}
              >
                Register
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
