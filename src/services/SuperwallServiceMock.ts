class SuperwallServiceMock {
  async showPaywall(): Promise<boolean> {
    // Имитация поведения платежной стены
    return new Promise(resolve => {
      setTimeout(() => {
        // Имитируем успешную покупку (true) или отмену (false)
        const success = true; // Для тестирования успешной покупки
        resolve(success);
      }, 2000);
    });
  }

  async hasActiveSubscription(): Promise<boolean> {
    return true; // Имитируем активную подписку
  }

  // Добавьте метод initialize для полной имитации
  initialize = async () => {
    console.log('Мок Superwall инициализирован');
    return true;
  };

  // Метод для имитации восстановления покупок
  restorePurchases = async (): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const success = true; // Имитируем успешное восстановление
        resolve(success);
      }, 1500);
    });
  };
}

export default new SuperwallServiceMock(); 