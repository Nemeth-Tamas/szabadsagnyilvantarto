import React, { useContext, useState } from 'react'
import { ThemeContext } from '../ThemeContext';
import { CalendarContainer } from '.';
import Calendar from 'react-calendar';
import { selectUser } from '../store/userSlice';
import { useSelector } from 'react-redux';

const CustomCalendarDisplayOnly = ({ selectedDates, context }) => {
  const { theme } = useContext(ThemeContext);
  const user = useSelector(selectUser);

  const titleClassName = ({ date, view }) => {
    if (view === 'month') {
      date.setHours(3, 0, 0, 0);
      const dateString = date.toISOString().split('T')[0];
      let classes = "";
      const value = selectedDates.get(dateString);
      if (value) {
        if (value === 'SZ') classes += "selected-day-sz";
        if (value === 'T') classes += "selected-day-t";
        if (value === 'H') classes += "selected-day-h";
        if (value === 'A') classes += "selected-day-a";
        if (value === 'SZSZ') classes += "selected-day-szsz";
      }

      if (dateString === new Date().toISOString().split('T')[0]) {
        classes += " current-day";
      }
      return classes;
    }
  }

  return (
    <CalendarContainer $dark={theme == "dark" && context != "modal"}>
      <Calendar
        tileClassName={titleClassName}
        value={null}
        defaultValue={selectedDates.size > 0 ? new Date([...selectedDates.keys()][0]) : new Date()}
      />
    </CalendarContainer>
  )
}

export default CustomCalendarDisplayOnly