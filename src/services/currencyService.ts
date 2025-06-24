export class CurrencyService {
  private static readonly FALLBACK_RATES: Record<string, number> = {
    'USD': 1.0,
    'EUR': 0.85,
    'GBP': 0.73,
    'NGN': 411.0,
    'GHS': 5.8,
    'KES': 110.0,
    'ZAR': 15.2,
    'CAD': 1.25,
    'AUD': 1.35
  };

  private static readonly API_ENDPOINT = 'https://api.exchangerate-api.com/v4/latest/USD';
  private static cachedRates: Record<string, number> | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds

  static async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    try {
      // Try to get live rates first
      const rates = await this.getLiveRates();
      const fromRate = rates[fromCurrency] || this.FALLBACK_RATES[fromCurrency] || 1;
      const toRate = rates[toCurrency] || this.FALLBACK_RATES[toCurrency] || 1;
      
      return toRate / fromRate;
    } catch (error) {
      console.warn('Failed to get live exchange rates, using fallback rates:', error);
      // Fall back to static rates
      const fromRate = this.FALLBACK_RATES[fromCurrency] || 1;
      const toRate = this.FALLBACK_RATES[toCurrency] || 1;
      return toRate / fromRate;
    }
  }

  private static async getLiveRates(): Promise<Record<string, number>> {
    const now = Date.now();
    
    // Return cached rates if they're still fresh
    if (this.cachedRates && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedRates;
    }

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.rates) {
        throw new Error('Invalid API response format');
      }

      // Update cache
      this.cachedRates = { USD: 1.0, ...data.rates };
      this.lastFetchTime = now;
      
      return this.cachedRates;
    } catch (error) {
      console.error('Failed to fetch live exchange rates:', error);
      
      // If we have cached rates, use them even if expired
      if (this.cachedRates) {
        console.warn('Using expired cached rates');
        return this.cachedRates;
      }
      
      // Otherwise, throw to fall back to static rates
      throw error;
    }
  }

  static async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    try {
      const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
      const convertedAmount = amount * exchangeRate;
      
      return Math.round(convertedAmount * 100) / 100;
    } catch (error) {
      console.error('Currency conversion error:', error);
      console.warn(`Returning original amount due to conversion failure`);
      return amount;
    }
  }

  static calculatePlatformFee(amount: number, userPlan: 'starter' | 'professional' | 'enterprise'): number {
    const feeRates = {
      starter: 0.05, // 5%
      professional: 0.03, // 3%
      enterprise: 0.01 // 1%
    };

    const feeRate = feeRates[userPlan] || 0.05;
    return Math.round(amount * feeRate * 100) / 100;
  }

  static getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
      { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
      { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
    ];
  }

  static formatCurrency(amount: number, currency: string): string {
    const currencyInfo = this.getSupportedCurrencies().find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || currency;
    
    return `${symbol}${amount.toFixed(2)}`;
  }

  static isValidCurrency(code: string): boolean {
    return this.getSupportedCurrencies().some(c => c.code === code);
  }

  static clearCache(): void {
    this.cachedRates = null;
    this.lastFetchTime = 0;
  }
}

// Export platform fees constant for backward compatibility
export const PLATFORM_FEES = {
  starter: 0.05,
  professional: 0.03,
  enterprise: 0.01
};
