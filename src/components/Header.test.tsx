import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Header from "./Header";

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/" };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock the auth context
const mockUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the NotificationBell and ProfileDropdown components
vi.mock("./NotificationBell", () => ({
  default: () => <div data-testid="notification-bell">Notification Bell</div>,
}));

vi.mock("./ProfileDropdown", () => ({
  default: () => <div data-testid="profile-dropdown">Profile Dropdown</div>,
}));

// Mock the logo import
vi.mock("@/assets/nba-logo.png", () => ({
  default: "mock-logo.png",
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHeader = (user = null) => {
    mockUseAuth.mockReturnValue({
      user,
      signOut: vi.fn(),
    });

    return render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  };

  it("renders the NBA Anaocha logo and title", () => {
    renderHeader();
    expect(screen.getByAltText("NBA Anaocha Logo")).toBeInTheDocument();
    expect(screen.getByText("NBA ANAOCHA")).toBeInTheDocument();
  });

  it("renders navigation links for unauthenticated users", () => {
    renderHeader();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Committees")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
  });

  it("renders Portal Access button for unauthenticated users", () => {
    renderHeader();
    expect(screen.getByText("Portal Access")).toBeInTheDocument();
  });

  it("has mobile menu button for unauthenticated users", () => {
    renderHeader();
    const menuButton = screen.getByRole("button");
    expect(menuButton).toBeInTheDocument();
  });

  it("renders notification bell and profile dropdown for authenticated users", () => {
    renderHeader({ id: "1", email: "test@example.com" });

    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
    expect(screen.getByTestId("profile-dropdown")).toBeInTheDocument();
  });

  it("does not render navigation links for authenticated users", () => {
    renderHeader({ id: "1", email: "test@example.com" });

    expect(screen.queryByText("About")).not.toBeInTheDocument();
    expect(screen.queryByText("Portal Access")).not.toBeInTheDocument();
  });
});