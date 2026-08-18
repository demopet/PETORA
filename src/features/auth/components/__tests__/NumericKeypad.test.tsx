import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumericKeypad } from "../NumericKeypad";

describe("NumericKeypad", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  it("renders correct number of boxes", () => {
    render(<NumericKeypad {...defaultProps} />);
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`pin-box-${i}`)).toBeInTheDocument();
    }
  });

  it("renders custom number of boxes", () => {
    render(<NumericKeypad {...defaultProps} length={4} />);
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`pin-box-${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId("pin-box-4")).not.toBeInTheDocument();
  });

  it("shows masked characters when mask=true", () => {
    render(<NumericKeypad {...defaultProps} value="123" mask={true} />);
    const box0 = screen.getByTestId("pin-box-0");
    expect(box0.textContent).toBe("•");
  });

  it("shows digits when mask=false", () => {
    render(<NumericKeypad {...defaultProps} value="123" mask={false} />);
    const box0 = screen.getByTestId("pin-box-0");
    expect(box0.textContent).toBe("1");
    const box1 = screen.getByTestId("pin-box-1");
    expect(box1.textContent).toBe("2");
  });

  it("calls onChange when digit button is pressed", async () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} onChange={onChange} />);

    await userEvent.click(screen.getByTestId("key-5"));
    expect(onChange).toHaveBeenCalledWith("5");
  });

  it("calls onChange for zero button", async () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} value="123" onChange={onChange} />);

    await userEvent.click(screen.getByTestId("key-0"));
    expect(onChange).toHaveBeenCalledWith("1230");
  });

  it("calls onChange with appended value on backspace", async () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} value="123" onChange={onChange} />);

    await userEvent.click(screen.getByTestId("key-backspace"));
    expect(onChange).toHaveBeenCalledWith("12");
  });

  it("calls onSubmit when enter key is pressed and value length matches", () => {
    const onSubmit = vi.fn();
    render(
      <NumericKeypad {...defaultProps} value="123456" onSubmit={onSubmit} />,
    );

    const container = screen.getByTestId("numeric-keypad");
    fireEvent.keyDown(container, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalled();
  });

  it("does not call onSubmit when value length does not match", () => {
    const onSubmit = vi.fn();
    render(<NumericKeypad {...defaultProps} value="123" onSubmit={onSubmit} />);

    const container = screen.getByTestId("numeric-keypad");
    fireEvent.keyDown(container, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("handles keyboard digit input", () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} onChange={onChange} />);

    const container = screen.getByTestId("numeric-keypad");
    fireEvent.keyDown(container, { key: "7" });
    expect(onChange).toHaveBeenCalledWith("7");
  });

  it("handles keyboard backspace", () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} value="12" onChange={onChange} />);

    const container = screen.getByTestId("numeric-keypad");
    fireEvent.keyDown(container, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("ignores non-numeric keyboard input", () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} onChange={onChange} />);

    const container = screen.getByTestId("numeric-keypad");
    fireEvent.keyDown(container, { key: "a" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables all inputs when disabled", async () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} onChange={onChange} disabled />);

    await userEvent.click(screen.getByTestId("key-1"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables all inputs when isLoading", async () => {
    const onChange = vi.fn();
    render(<NumericKeypad {...defaultProps} onChange={onChange} isLoading />);

    await userEvent.click(screen.getByTestId("key-1"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("displays error message", () => {
    render(<NumericKeypad {...defaultProps} error="PIN salah" />);
    expect(screen.getByTestId("error-message")).toHaveTextContent("PIN salah");
  });

  it("does not display error message when error is null", () => {
    render(<NumericKeypad {...defaultProps} error={null} />);
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("disables submit button when value length does not match", () => {
    render(<NumericKeypad {...defaultProps} value="123" />);
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("enables submit button when value length matches", () => {
    render(<NumericKeypad {...defaultProps} value="123456" />);
    expect(screen.getByTestId("submit-button")).not.toBeDisabled();
  });

  it("toggles mask visibility when toggle button is clicked", async () => {
    render(<NumericKeypad {...defaultProps} value="123" mask={true} />);

    const box0 = screen.getByTestId("pin-box-0");
    expect(box0.textContent).toBe("•");

    await userEvent.click(screen.getByTestId("key-toggle"));
    expect(box0.textContent).toBe("1");

    await userEvent.click(screen.getByTestId("key-toggle"));
    expect(box0.textContent).toBe("•");
  });

  it("does not render toggle button when showToggle is false", () => {
    render(<NumericKeypad {...defaultProps} showToggle={false} />);
    expect(screen.queryByTestId("key-toggle")).not.toBeInTheDocument();
  });

  it("prevents input beyond length", async () => {
    const onChange = vi.fn();
    render(
      <NumericKeypad {...defaultProps} value="123456" onChange={onChange} />,
    );

    await userEvent.click(screen.getByTestId("key-1"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
