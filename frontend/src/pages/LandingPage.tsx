import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  departments,
  years,
  type Department,
  type Year,
} from "../constants/departments";
import easeChaosLogo from "../../assets/easechaos.png";
import ThemeToggle from "../components/ThemeToggle";
import clsx from "clsx";

export default function LandingPage() {
  const [selectedDept, setSelectedDept] = useState<Department | "">("");
  const [selectedYear, setSelectedYear] = useState<Year | "">("");
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setShowNotification(true);
    const timer = setTimeout(() => {
      setFadeOut(true);
      const hideTimer = setTimeout(() => {
        setShowNotification(false);
      }, 500);
      return () => clearTimeout(hideTimer);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewSchedule = () => {
    if (selectedDept && selectedYear) {
      navigate(`/timetable/${selectedDept}/${selectedYear.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#02040A] flex flex-col items-center justify-center p-4 md:p-6 mx-auto overflow-hidden relative">
      <div className="absolute top-0 w-full h-[60vh] dark:h-[70vh] bg-[url('../assets/light_pattern.svg')] dark:bg-[url('../assets/dark_pattern.svg')] bg-cover bg-center dark:opacity-15 opacity-65" />

      {showNotification && (
        <div
          className={`absolute top-6 flex items-center px-3 py-2 bg-green-400 border-2 border-green-700 rounded-full z-10 ${
            fadeOut ? "animate-fade-out" : "animate-slide-in"
          }`}
        >
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative size-5"
          >
            <path
              d="M8 15C12.8747 15 15 12.949 15 8C15 12.949 17.1104 15 22 15C17.1104 15 15 17.1104 15 22C15 17.1104 12.8747 15 8 15Z"
              stroke-width="1.5"
              stroke-linejoin="round"
              className="stroke-green-700"
            ></path>
            <path
              d="M2 6.5C5.13376 6.5 6.5 5.18153 6.5 2C6.5 5.18153 7.85669 6.5 11 6.5C7.85669 6.5 6.5 7.85669 6.5 11C6.5 7.85669 5.13376 6.5 2 6.5Z"
              stroke-width="1.5"
              stroke-linejoin="round"
              className="stroke-green-700"
            ></path>
          </svg>
          <span className="text-sm text-green-900">
            Coming soon: Examination schedule view
          </span>
        </div>
      )}
      <div className="relative max-w-4xl w-full text-center space-y-6">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <div className="flex justify-end px-4">
            <ThemeToggle />
          </div>

          <a
            href="https://github.com/Easechaos/easechaos"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "group inline-flex items-center",
              "border border-gray-400 dark:border-[#303030]",
              "px-4 py-2",
              "bg-gray-200 dark:bg-[#09090B]",
              "rounded-full",
              "text-md text-[#71717A] dark:text-[#D4D4D8]",
              "hover:bg-gray-100 dark:hover:bg-[#303030]",
              "transition-colors duration-200"
            )}
          >
            Star us on GitHub
            <span className="ml-2 group-hover:hidden">→</span>
            <svg
              className="ml-2 w-4 h-4 hidden group-hover:block"
              fill="none"
              strokeWidth={2}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeWidth={2}
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </a>
          <div className="flex flex-row justify-center items-center p-4">
            <h1 className="mt-4 inline-block text-wrap bg-gradient-to-b from-gray-800 via-gray-700 to-gray-500 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent text-4xl font-semibold md:text-5xl xl:text-6xl xl:[line-height:1.125]">
              EaseCHAOS
            </h1>
            <img src={easeChaosLogo} alt="EaseCHAOS" className="w-15 h-10" />
          </div>

          <p className="text-xl text-[#71717A] dark:text-[#D4D4D8] max-w-md mx-auto leading-relaxed">
            Simplified academic schedules with intuitive viewing, and
            mobile-friendly.
          </p>
        </div>

        {/* Selector Section */}
        <div className="relative w-full">
          <div className="relative z-10 shadow-sm bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#303030] rounded-lg p-4 space-y-4 max-w-sm mx-auto">
            <div className="space-y-4">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value as Department)}
                className="w-full bg-[#F4F4F5] dark:bg-[#262626] p-3 border border-gray-300 dark:border-[#303030] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-[#D4D4D8]"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear ? selectedYear.name : ""}
                onChange={(e) =>
                  setSelectedYear(
                    years.find((y) => y.name === e.target.value) || ""
                  )
                }
                className="w-full p-3 bg-[#F4F4F5] dark:bg-[#303030] border border-gray-300 dark:border-[#303030] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-[#D4D4D8]"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year.id} value={year.name}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleViewSchedule}
              disabled={!selectedDept || !selectedYear}
              className="w-full bg-[#52525B] text-white py-4 px-6 rounded-md hover:bg-[#18181B]-700 
                     disabled:bg-[#F4F4F5] disabled:text-[#18181B] disabled:cursor-not-allowed
                     transition-colors duration-200"
            >
              View Schedule
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="w-[300px] max-w-full">
            <div className="text-card-foreground shadow-sm relative overflow-hidden rounded-xl border bg-white dark:bg-[#09090B] dark:border-[#303030]">
              <div className="flex flex-col space-y-1.5 p-6 justify-center items-center">
                <h3 className="font-semibold tracking-tight flex items-center gap-2 text-lg dark:text-[#F0F6FC]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Quick Access
                </h3>
                <p className="text-md pt-2 pb-4 mx-4 leading-7 text-[#71717A] dark:text-[#D4D4D8]">
                  Instantly view your class schedule with just two selections.
                </p>
              </div>
            </div>
          </div>

          <div className="w-[300px] max-w-full">
            <div className="text-card-foreground shadow-sm relative overflow-hidden rounded-xl border bg-white dark:bg-[#09090B] dark:border-[#303030]">
              <div className="flex flex-col space-y-1.5 p-6 justify-center items-center">
                <h3 className="font-semibold tracking-tight flex items-center gap-2 text-lg dark:text-[#F0F6FC]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Weekly Overview
                </h3>
                <p className="text-md pt-2 pb-4 mx-4 leading-7 text-[#71717A] dark:text-[#D4D4D8]">
                  See your entire week at a glance with our intuitive calendar
                  view
                </p>
              </div>
            </div>
          </div>

          <div className="w-[300px] max-w-full">
            <div className="text-card-foreground shadow-sm relative overflow-hidden rounded-xl border bg-white dark:bg-[#09090B] dark:border-[#303030]">
              <div className="flex flex-col space-y-1.5 p-6 justify-center items-center">
                <h3 className="font-semibold tracking-tight flex items-center gap-2 text-lg dark:text-[#F0F6FC]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                  Mobile Friendly
                </h3>
                <p className="text-md pt-2 pb-4 mx-4 leading-7 text-[#71717A] dark:text-[#D4D4D8]">
                  Access your schedule on any device, anywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-4 py-6 ">
        <div className="container flex items-center justify-center p-0">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-6 w-6 dark:text-[#F0F6FC]"
          >
            <path
              d="M9.96424 2.68571C10.0668 2.42931 9.94209 2.13833 9.6857 2.03577C9.4293 1.93322 9.13832 2.05792 9.03576 2.31432L5.03576 12.3143C4.9332 12.5707 5.05791 12.8617 5.3143 12.9642C5.5707 13.0668 5.86168 12.9421 5.96424 12.6857L9.96424 2.68571ZM3.85355 5.14646C4.04882 5.34172 4.04882 5.6583 3.85355 5.85356L2.20711 7.50001L3.85355 9.14646C4.04882 9.34172 4.04882 9.6583 3.85355 9.85356C3.65829 10.0488 3.34171 10.0488 3.14645 9.85356L1.14645 7.85356C0.951184 7.6583 0.951184 7.34172 1.14645 7.14646L3.14645 5.14646C3.34171 4.9512 3.65829 4.9512 3.85355 5.14646ZM11.1464 5.14646C11.3417 4.9512 11.6583 4.9512 11.8536 5.14646L13.8536 7.14646C14.0488 7.34172 14.0488 7.6583 13.8536 7.85356L11.8536 9.85356C11.6583 10.0488 11.3417 10.0488 11.1464 9.85356C10.9512 9.6583 10.9512 9.34172 11.1464 9.14646L12.7929 7.50001L11.1464 5.85356C10.9512 5.6583 10.9512 5.34172 11.1464 5.14646Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
          <p className="text-xs sm:text-sm dark:text-[#F0F6FC]">
            Designed by{" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/ABZABI"
            >
              Abdul-Manan Femanya
            </a>
            , built by{" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/0xdvc"
            >
              Ohene Neil
            </a>
            ,{" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/aaron-ontoyin"
            >
              Ontoyin Aaron Yin
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/db-keli"
            >
              Dompeh Kofi Bright
            </a>
            . Get the source code from{" "}
            <a
              className="underline underline-offset-4"
              href="https://github.com/Easechaos/easechaos"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
