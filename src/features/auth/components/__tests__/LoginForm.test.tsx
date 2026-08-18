import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

describe("LoginForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isLoading: false,
    error: null,
    lockoutUntil: null,
  };

  it("renders username input and keypad", () => {
    render(<LoginForm {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/masukkan username/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("numeric-keypad")).toBeInTheDocument();
  });

  it("shows username error on submit with short username", async () => {
    const onSubmit = vi.fn();
    render(<LoginForm {...defaultProps} onSubmit={onSubmit} />);

    const usernameInput = screen.getByPlaceholderText(/masukkan username/i);
    await userEvent.type(usernameInput, "ab");

    for (let i = 1; i <= 6; i++) {
      await userEvent.click(screen.getByTestId(`key-${i}`));
    }

    await userEvent.click(screen.getByTestId("submit-button"));

    expect(
      screen.getByText(/username minimal 3 karakter/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid credentials", async () => {
    const onSubmit = vi.fn();
    render(<LoginForm {...defaultProps} onSubmit={onSubmit} />);

    const usernameInput = screen.getByPlaceholderText(/masukkan username/i);
    await userEvent.type(usernameInput, "testuser");

    for (let i = 1; i <= 6; i++) {
      await userEvent.click(screen.getByTestId(`key-${i}`));
    }

    await userEvent.click(screen.getByTestId("submit-button"));

    expect(onSubmit).toHaveBeenCalledWith({
      username: "testuser",
      pin: "123456",
    });
  });

  it("displays error message", () => {
    render(<LoginForm {...defaultProps} error="Invalid credentials" />);
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Invalid credentials",
    );
  });

  it("displays lockout message", () => {
    const lockoutUntil = new Date(Date.now() + 5 * 60 * 1000);
    render(<LoginForm {...defaultProps} lockoutUntil={lockoutUntil} />);
    expect(screen.getByTestId("lockout-message")).toHaveTextContent(
      "Akun terkunci",
    );
  });

  it("disables inputs when loading", () => {
    render(<LoginForm {...defaultProps} isLoading />);
    expect(screen.getByPlaceholderText(/masukkan username/i)).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("disables inputs when locked out", () => {
    const lockoutUntil = new Date(Date.now() + 5 * 60 * 1000);
    render(<LoginForm {...defaultProps} lockoutUntil={lockoutUntil} />);
    expect(screen.getByPlaceholderText(/masukkan username/i)).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("submit button is disabled when PIN length is less than 6", () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("submit button is enabled when PIN length is 6", async () => {
    render(<LoginForm {...defaultProps} />);

    for (let i = 1; i <= 6; i++) {
      await userEvent.click(screen.getByTestId(`key-${i}`));
    }

    expect(screen.getByTestId("submit-button")).not.toBeDisabled();
  });
});
