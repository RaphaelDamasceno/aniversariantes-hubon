import { isBirthdayToday, isBirthdayThisWeek, isBirthdayThisMonth } from './date-rules';

describe('Date Rules', () => {
  describe('isBirthdayToday', () => {
    it('deve retornar verdadeiro se o aniversário for hoje, desconsiderando o ano', () => {
      const today = new Date(2026, 6, 21); // 21 de Julho de 2026 (meses são 0-indexed no JS)
      expect(isBirthdayToday('1990-07-21', today)).toBe(true);
      expect(isBirthdayToday('1985-07-21', today)).toBe(true);
    });

    it('deve retornar falso se não for aniversário', () => {
      const today = new Date(2026, 6, 21);
      expect(isBirthdayToday('1990-07-22', today)).toBe(false);
      expect(isBirthdayToday('1990-08-21', today)).toBe(false);
    });

    it('deve considerar 28/fev como aniversário caso a pessoa nasceu em 29/fev num ano não bissexto', () => {
      // 2026 NÃO é bissexto
      const today = new Date(2026, 1, 28); // 28 Fev 2026
      expect(isBirthdayToday('1996-02-29', today)).toBe(true);
    });

    it('deve considerar 29/fev como aniversário APENAS em 29/fev se o ano for bissexto', () => {
      // 2024 É bissexto
      const today28 = new Date(2024, 1, 28);
      const today29 = new Date(2024, 1, 29);
      expect(isBirthdayToday('1996-02-29', today28)).toBe(false);
      expect(isBirthdayToday('1996-02-29', today29)).toBe(true);
    });
  });

  describe('isBirthdayThisWeek', () => {
    it('deve retornar verdadeiro se o aniversário estiver dentro da semana atual', () => {
      // Semana de 19/07/2026 (Domingo) a 25/07/2026 (Sábado)
      const baseDate = new Date(2026, 6, 21); // 21/07/2026 (Terça-feira)
      
      expect(isBirthdayThisWeek('1990-07-19', baseDate)).toBe(true); // Domingo da mesma semana
      expect(isBirthdayThisWeek('1980-07-25', baseDate)).toBe(true); // Sábado da mesma semana
      expect(isBirthdayThisWeek('1995-07-21', baseDate)).toBe(true); // Mesmo dia
      
      expect(isBirthdayThisWeek('1990-07-18', baseDate)).toBe(false); // Sábado passado
      expect(isBirthdayThisWeek('1980-07-26', baseDate)).toBe(false); // Próximo domingo
    });

    it('deve funcionar corretamente na virada de ano', () => {
      // Semana de 28/Dez/2025 (Dom) a 03/Jan/2026 (Sáb)
      const baseDate = new Date(2025, 11, 31); // 31/12/2025 (Quarta)
      
      // Aniversariante do dia 02 de Janeiro (ano que vem, mas na mesma semana atual)
      expect(isBirthdayThisWeek('1990-01-02', baseDate)).toBe(true);
      // Aniversariante do dia 29 de Dezembro (mesmo ano, na mesma semana)
      expect(isBirthdayThisWeek('1985-12-29', baseDate)).toBe(true);
      // Aniversariante fora da semana
      expect(isBirthdayThisWeek('1990-01-04', baseDate)).toBe(false);
    });

    it('deve suportar 29 de fevereiro na semana, em anos não bissextos (cai p/ 28 fev)', () => {
      // Semana de 22/Fev/2026 (Dom) a 28/Fev/2026 (Sáb)
      const baseDate = new Date(2026, 1, 25);
      
      // A pessoa nasceu em 29/02/1996. Em 2026 (não bissexto), consideramos 28/02.
      // E 28/02/2026 é um Sábado, logo está na MESMA semana.
      expect(isBirthdayThisWeek('1996-02-29', baseDate)).toBe(true);
    });
  });

  describe('isBirthdayThisMonth', () => {
    it('deve retornar verdadeiro se o aniversário for no mês atual', () => {
      const today = new Date(2026, 6, 15); // 15 de Julho de 2026
      
      expect(isBirthdayThisMonth('1990-07-01', today)).toBe(true);
      expect(isBirthdayThisMonth('1985-07-31', today)).toBe(true);
    });

    it('deve retornar falso se o aniversário for em outro mês', () => {
      const today = new Date(2026, 6, 15); // Julho
      
      expect(isBirthdayThisMonth('1990-06-30', today)).toBe(false);
      expect(isBirthdayThisMonth('1990-08-01', today)).toBe(false);
    });
  });
});
