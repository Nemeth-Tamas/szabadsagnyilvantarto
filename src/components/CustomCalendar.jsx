import React, { useContext } from 'react'
import { ThemeContext } from '../ThemeContext';
import { CalendarContainer } from '.';
import Calendar from 'react-calendar';

const CustomCalendar = ({ selectedDates, setSelectedDates, displayMonth = null }) => {
  const { theme } = useContext(ThemeContext);

  const handleDateClick = (date) => {
    date.setHours(3, 0, 0, 0);
    setSelectedDates((prevSelectedDates) => {
      const dateString = date.toISOString().split('T')[0];
      return prevSelectedDates.includes(dateString)
        ? prevSelectedDates.filter((d) => d !== dateString)
        : [...prevSelectedDates, dateString];
    });
  }

  const titleClassName = ({ date, view }) => {
    if (view === 'month') {
      date.setHours(3, 0, 0, 0);
      const dateString = date.toISOString().split('T')[0];
      let classes = "";
      if (selectedDates.includes(dateString)) {
        classes += "selected-day";
      }

      if (dateString === new Date().toISOString().split('T')[0]) {
        classes += " current-day";
      }
      return classes;
    }
  }

  const testClick = (date, event) => {
    console.log(date);
    console.log(event);
    console.log(selectedDates);
  }

  return (
    <CalendarContainer $dark={theme == "dark"}>
      <Calendar
        onClickDay={testClick}
        onChange={handleDateClick}
        tileClassName={titleClassName}
        value={null}
        showNavigation={displayMonth === null}
        activeStartDate={displayMonth === null ? null : new Date(new Date().setMonth(displayMonth - 1))}
      />
     </CalendarContainer> 
  )
}

export default CustomCalendar