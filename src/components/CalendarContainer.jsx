import styled from "styled-components";

export const CalendarContainer = styled.div`
  margin: auto;
  margin-top: 20px;
  background-color: ${props => props.$dark ? "#1a1a1a" : "#e6e6e6"};
  padding: 10px;
  border-radius: 5px;

  .react-calendar__navigation {
    display: flex;

    .react-calendar__navigation__label {
      font-weight: bold;
    }

    .react-calendar__navigation__arrow {
      flex-grow: 0.333;
    }
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-decoration: none;
  }

  button {
    font-size: 1.2rem;
    margin: 3px;
    background-color: #6f876f;
    border: 0;
    border-radius: 5px;
    color: white;
    padding: 5px 0;

    &:hover {
      background-color: #556b55;
    }

    &:active {
      background-color: #a5c1a5;
    }
  }

  .react-calendar__month-view__days {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr);

    .react-calendar__tile {
      max-width: initial !important;
    }

    .react-calendar__tile--range {
      box-shadow: 0 0 6px 2px black;
    }
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    opacity: 0.5;
  }

  .react-calendar__month-view__days__day--weekend {
    color: #dfdfdf;
    background-color: #4d654d;
  }

  .react-calendar__year-view__months, .react-calendar__decade-view__years, .react-calendar__century-view__decades {
    display: grid !important;
    grid-template-columns: repeat(5, 1fr);

    &.react-calendar__year-view__months {
      grid-template-columns: repeat(4, 1fr);
    }

    .react-calendar__title {
      max-width: initial !important;
    }
  }

  .selected-day {
    background-color: red !important;
    box-shadow: inset 4px 4px 4px 0px rgba(0,0,0,0.4) !important;
  }

  .selected-day-sz {
    background-color: #6c757d !important;
    box-shadow: inset 4px 4px 4px 0px rgba(0,0,0,0.4) !important;
  }

  .selected-day-t {
    background-color: red !important;
    box-shadow: inset 4px 4px 4px 0px rgba(0,0,0,0.4) !important;
  }

  .selected-day-h {
    background-color: #212529 !important;
    box-shadow: inset 4px 4px 4px 0px rgba(0,0,0,0.4) !important;
  }

  .selected-day-a {
    background-color: cyan !important;
    color: black;
    box-shadow: inset 4px 4px 4px 0px rgba(0,0,0,0.4) !important;
  }

  .selected-day-szsz {
    background-color: yellow !important;
    color: black;
    box-shadow: inset 4px 4px 4px 0px rgba(0,0,0,0.4) !important;
  }
  
  .current-day {
    background-color: #bbbbbb;
    color: black;
  }
`;