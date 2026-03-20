import { useState, useMemo, useEffect, useCallback } from "react";
import type { StudentData } from "./useTeacherDashboardData";

type GenderOption = "All Genders" | "Male" | "Female";
type SortKey = "name" | "rating" | "generation" | "class" | "gender" | "status";
type SortDirection = "asc" | "desc";

interface UseStudentFiltersProps {
  students: StudentData[];
}

interface UseStudentFiltersReturn {
  // State
  selectedGen: string;
  selectedClass: string;
  selectedGender: GenderOption;
  searchQuery: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  currentPage: number;

  // Computed
  gens: string[];
  classes: string[];
  filteredStudents: StudentData[];
  sortedStudents: StudentData[];
  paginatedStudents: StudentData[];
  totalPages: number;

  // Actions
  setSelectedGen: (gen: string) => void;
  setSelectedClass: (cls: string) => void;
  setSelectedGender: (gender: GenderOption) => void;
  setSearchQuery: (query: string) => void;
  setSortKey: (key: SortKey) => void;
  setSortDirection: (dir: SortDirection) => void;
  goToPage: (page: number) => void;
  clearFilters: () => void;
}

export function useStudentFilters({
  students,
}: UseStudentFiltersProps): UseStudentFiltersReturn {
  const [selectedGen, setSelectedGen] = useState("All Generations");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedGender, setSelectedGender] =
    useState<GenderOption>("All Genders");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Computed filter options
  const gens = useMemo(
    () => [
      "All Generations",
      ...Array.from(new Set(students.map((s) => s.generation)))
        .filter(Boolean)
        .sort(),
    ],
    [students],
  );

  const classes = useMemo(() => {
    const scopedStudents =
      selectedGen === "All Generations"
        ? students
        : students.filter((s) => s.generation === selectedGen);
    return [
      "All Classes",
      ...Array.from(new Set(scopedStudents.map((s) => s.class)))
        .filter(Boolean)
        .sort(),
    ];
  }, [selectedGen, students]);

  // Reset selections if invalid
  useEffect(() => {
    if (!gens.includes(selectedGen)) setSelectedGen("All Generations");
    if (!classes.includes(selectedClass)) setSelectedClass("All Classes");
  }, [gens, classes, selectedGen, selectedClass]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const matchesGen =
        selectedGen === "All Generations" || student.generation === selectedGen;
      const matchesClass =
        selectedClass === "All Classes" || student.class === selectedClass;
      const matchesGender =
        selectedGender === "All Genders" ||
        (selectedGender === "Male" && student.gender === "male") ||
        (selectedGender === "Female" && student.gender === "female");
      const matchesSearch =
        !normalizedQuery ||
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.studentId.toLowerCase().includes(normalizedQuery);
      return matchesGen && matchesClass && matchesGender && matchesSearch;
    });
  }, [students, selectedGen, selectedClass, selectedGender, searchQuery]);

  // Sorted students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "rating":
          aVal = a.rating ?? -Infinity;
          bVal = b.rating ?? -Infinity;
          break;
        case "generation":
          aVal = a.generation;
          bVal = b.generation;
          break;
        case "class":
          aVal = a.class;
          bVal = b.class;
          break;
        case "gender":
          aVal = a.gender ?? "";
          bVal = b.gender ?? "";
          break;
        case "status":
          const statusOrder: Record<StudentData["status"], number> = {
            "Action Needed": 0,
            Healthy: 1,
            "No Data": 2,
          };
          aVal = statusOrder[a.status] ?? 3;
          bVal = statusOrder[b.status] ?? 3;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortKey, sortDirection]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(sortedStudents.length / pageSize);
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Reset page on filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    sortedStudents.length,
    selectedGen,
    selectedClass,
    selectedGender,
    searchQuery,
  ]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    },
    [totalPages],
  );

  const clearFilters = useCallback(() => {
    setSelectedGen("All Generations");
    setSelectedClass("All Classes");
    setSelectedGender("All Genders");
    setSearchQuery("");
    setSortKey("status");
    setSortDirection("asc");
  }, []);

  return {
    // State
    selectedGen,
    selectedClass,
    selectedGender,
    searchQuery,
    sortKey,
    sortDirection,
    currentPage,
    // Computed
    gens,
    classes,
    filteredStudents,
    sortedStudents,
    paginatedStudents,
    totalPages,
    // Actions
    setSelectedGen,
    setSelectedClass,
    setSelectedGender,
    setSearchQuery,
    setSortKey,
    setSortDirection,
    goToPage,
    clearFilters,
  };
}
