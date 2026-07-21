import { startOfWeek, endOfWeek, parseISO, isWithinInterval, setYear, getYear, isLeapYear } from 'date-fns';

/**
 * Normaliza a data de aniversário para o ano atual, para que possamos comparar
 * se o aniversário cai na semana atual do ano em que estamos.
 * Lida com o caso de aniversariantes em 29 de fevereiro. Se não for ano bissexto,
 * consideramos o aniversário no dia 28 de fevereiro.
 */
export function normalizeBirthdayToCurrentYear(birthdayISO: string, currentYear: number): Date {
  const birthDate = parseISO(birthdayISO);
  
  // Se o aniversário for 29 de fev, mas o ano atual não for bissexto,
  // ajustamos para 28 de fev do ano atual
  if (birthDate.getMonth() === 1 && birthDate.getDate() === 29 && !isLeapYear(new Date(currentYear, 0, 1))) {
    return new Date(currentYear, 1, 28);
  }
  
  return setYear(birthDate, currentYear);
}

/**
 * Verifica se a data de nascimento informada (formato YYYY-MM-DD) é hoje,
 * independente do ano de nascimento.
 */
export function isBirthdayToday(birthdayISO: string, today: Date = new Date()): boolean {
  if (!birthdayISO) return false;
  const birthDate = parseISO(birthdayISO);
  
  const isFeb29 = birthDate.getMonth() === 1 && birthDate.getDate() === 29;
  const todayIsFeb28 = today.getMonth() === 1 && today.getDate() === 28;
  const currentYearNotLeap = !isLeapYear(today);

  // Se faz aniversário em 29/02 e hoje é 28/02 de um ano não bissexto, é hoje!
  if (isFeb29 && todayIsFeb28 && currentYearNotLeap) {
    return true;
  }

  return birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate();
}

/**
 * Verifica se a data de nascimento informada cai na mesma semana da data base (hoje).
 * Uma semana vai de Domingo a Sábado (ou Segunda a Domingo dependendo do locale, aqui usaremos padrão: Domingo a Sábado).
 */
export function isBirthdayThisWeek(birthdayISO: string, today: Date = new Date()): boolean {
  if (!birthdayISO) return false;
  
  const currentYear = getYear(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Sábado
  
  let normalizedBirthday = normalizeBirthdayToCurrentYear(birthdayISO, currentYear);
  
  // Verifica se o aniversário está na semana do ano atual
  let isThisWeek = isWithinInterval(normalizedBirthday, { start: weekStart, end: weekEnd });
  
  // Casos de borda: Virada de Ano!
  // Se a semana contém dias de DOIS ANOS diferentes (ex: semana começa em 29/Dez/2025 e termina em 04/Jan/2026)
  // precisamos checar o aniversário normalizado para ambos os anos (currentYear e nextYear/prevYear)
  if (getYear(weekStart) !== getYear(weekEnd)) {
    // A semana cruza anos
    const year1 = getYear(weekStart);
    const year2 = getYear(weekEnd);
    
    const bDayYear1 = normalizeBirthdayToCurrentYear(birthdayISO, year1);
    const bDayYear2 = normalizeBirthdayToCurrentYear(birthdayISO, year2);
    
    return isWithinInterval(bDayYear1, { start: weekStart, end: weekEnd }) ||
           isWithinInterval(bDayYear2, { start: weekStart, end: weekEnd });
  }

  return isThisWeek;
}
