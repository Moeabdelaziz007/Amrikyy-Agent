import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AINotes from "../AINotes";

// Mock Firebase hooks
const mockSaveNote = vi.fn();
const mockUpdateNote = vi.fn();
const mockDeleteNote = vi.fn();

vi.mock("../hooks/useFirebase", () => ({
  useAuth: () => ({
    user: { uid: "test-user-id" },
    isAuthenticated: true,
  }),
  useNotes: () => ({
    notes: [
      {
        id: "note-1",
        title: "Existing Note",
        content: "<p>This is an existing note.</p>",
        tags: ["test"],
      },
    ],
    loading: false,
    saveNote: mockSaveNote,
    updateNote: mockUpdateNote,
    deleteNote: mockDeleteNote,
  }),
}));

// Mock TipTap editor
const mockSetContent = vi.fn();
const mockGetHTML = vi.fn(() => "<p>Test content</p>");

vi.mock("@tiptap/react", async () => {
  const actual = await vi.importActual("@tiptap/react");
  return {
    ...actual,
    useEditor: () => ({
      // A simplified mock of the editor instance
      // We can expand this as needed for more complex tests
      chain: () => ({
        focus: () => ({
          run: () => {},
        }),
      }),
      getHTML: mockGetHTML,
      on: () => {},
      off: () => {},
      destroy: () => {},
      commands: { setContent: mockSetContent },
      isDestroyed: true,
      isEditable: true,
      state: {
        doc: {
          content: [],
        },
      },
    }),
    EditorContent: ({ editor }) => (
      <div data-testid="editor-content">{editor?.getHTML()}</div>
    ),
  };
});

describe("AINotes Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with title, notes list, and editor", () => {
    render(<AINotes isOpen={true} onClose={() => {}} />);

    // Check for the title
    expect(screen.getByText("AI Notes")).toBeInTheDocument();

    // Check for existing note in the sidebar
    expect(screen.getByText("Existing Note")).toBeInTheDocument();

    // Check for the mocked editor content
    const editor = screen.getByTestId("editor-content");
    expect(editor).toBeInTheDocument();
    expect(
      screen.getByText("Select a note to view or create a new one.")
    ).toBeInTheDocument();
  });

  it("should not render if isOpen is false", () => {
    render(<AINotes isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("AI Notes")).not.toBeInTheDocument();
  });

  it("should display a note's content when selected", async () => {
    render(<AINotes isOpen={true} onClose={() => {}} />);

    const existingNoteItem = screen.getByText("Existing Note");
    fireEvent.click(existingNoteItem);

    await waitFor(() => {
      expect(mockSetContent).toHaveBeenCalledWith(
        "<p>This is an existing note.</p>"
      );
    });
  });

  it("should call saveNote when saving a new note", async () => {
    mockSaveNote.mockResolvedValue({ success: true, id: "new-note-id" });
    render(<AINotes isOpen={true} onClose={() => {}} />);

    const newNoteButton = screen.getByText("New Note");
    fireEvent.click(newNoteButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("New Note")).toBeInTheDocument();
    });

    const saveButton = screen.getByTitle("Save Note");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveNote).toHaveBeenCalledWith({
        title: "New Note",
        content: "<p>Test content</p>",
        tags: [],
      });
    });
  });
});
