import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SetupForm from "./SetupForm.jsx";

describe("SetupForm", () => {
  it("renders fields from goal templates", () => {
    render(<SetupForm goalType="focus" answers={{}} onChange={vi.fn()} />);

    expect(screen.getByText("Focus / Studying")).toBeInTheDocument();
    expect(screen.getByLabelText("Focus objective")).toBeInTheDocument();
    expect(screen.getByLabelText("Target focus hours per day")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred session length")).toBeInTheDocument();
  });
});
