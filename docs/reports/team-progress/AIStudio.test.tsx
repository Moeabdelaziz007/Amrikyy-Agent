import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AIStudio from "../AIStudio";

// Mock the YouTubeIntegration component as it's complex
vi.mock("../YouTubeIntegration", () => ({
  default: () => (
    <div data-testid="youtube-integration">YouTube Integration Mock</div>
  ),
}));

describe("AIStudio Component", () => {
  it("should render the main studio interface when open", () => {
    render(<AIStudio isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("AI Studio VE03")).toBeInTheDocument();
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("Effects")).toBeInTheDocument();
    expect(screen.getByTestId("youtube-integration")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<AIStudio isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("AI Studio VE03")).not.toBeInTheDocument();
  });
});
