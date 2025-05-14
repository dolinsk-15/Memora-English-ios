import SuperwallServiceReal from './SuperwallService';
import SuperwallServiceMock from './SuperwallServiceMock';

// Переключатель для разработки
const USE_MOCK = true; // Изменить на false при тестировании настоящего Superwall

const SuperwallService = USE_MOCK ? SuperwallServiceMock : SuperwallServiceReal;

export default SuperwallService; 