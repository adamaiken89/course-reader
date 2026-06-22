import { describe, expect, test, afterEach } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import SubjectListView from "../../mainview/components/SubjectListView";
import { mockFetch, restoreFetch } from "./mock-fetch";

const mockSubjects = [
  {
    id: "math-101",
    subject: "Mathematics 101",
    displayName: "Mathematics 101",
    domain: "mathematics",
    prerequisites: [],
    modules: [
      { id: 1, name: "Algebra Basics", timeHours: 3, prerequisites: [], topics: [] },
      { id: 2, name: "Geometry", timeHours: 2, prerequisites: [], topics: [] },
    ],
    timeBudgetHours: 20,
    targetLevel: "beginner",
    learningObjectives: ["Understand algebra", "Solve equations"],
  },
  {
    id: "physics",
    subject: "Physics",
    displayName: "Physics",
    domain: "physics",
    prerequisites: [],
    modules: [{ id: 1, name: "Mechanics", timeHours: 5, prerequisites: [], topics: [] }],
    timeBudgetHours: 30,
    targetLevel: "intermediate",
    learningObjectives: [],
  },
];

const defaultProps = {
  onSelectSubject: () => {},
  onOpenSettings: () => {},
  onOpenBookmarks: () => {},
};

afterEach(restoreFetch);

describe("SubjectListView snapshots", () => {
  test("loading state", () => {
    mockFetch({ "/subjects": mockSubjects });
    const { container } = render(<SubjectListView {...defaultProps} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  test("error state", async () => {
    (globalThis as Record<string, unknown>).fetch = async () =>
      new Response(JSON.stringify({ error: "Server down" }), { status: 500 });
    const { container } = render(<SubjectListView {...defaultProps} />);
    await waitFor(() =>
      expect(container.textContent).toContain("Error")
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  test("content state with subjects", async () => {
    mockFetch({ "/subjects": mockSubjects });
    const { container } = render(<SubjectListView {...defaultProps} />);
    await waitFor(() =>
      expect(container.textContent).toContain("Mathematics 101")
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  test("empty state (no subjects)", async () => {
    mockFetch({ "/subjects": [] });
    const { container } = render(<SubjectListView {...defaultProps} />);
    await waitFor(() =>
      expect(container.textContent).toContain("No subjects found")
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
