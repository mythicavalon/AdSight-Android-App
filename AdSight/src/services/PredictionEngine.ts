import { Platform, UserProfile, AdPrediction, AdCategory, AdMapping, PlatformMapping } from '../types';
import adMappingsData from '../data/adMappings.json';

export class PredictionEngine {
  private adMappings: AdMapping;

  constructor() {
    this.adMappings = adMappingsData as AdMapping;
  }

  /**
   * Generate ad predictions for a specific platform based on user profile
   */
  generatePredictions(userProfile: UserProfile, platform: Platform): AdPrediction {
    const platformMapping = this.adMappings.platforms[platform];
    
    if (!platformMapping) {
      throw new Error(`Platform ${platform} not supported`);
    }

    const categories = this.calculateCategoryProbabilities(userProfile, platformMapping);
    const reasoning = this.generateReasoning(userProfile, platformMapping, categories);
    
    // Calculate overall confidence based on data completeness
    const confidence = this.calculateOverallConfidence(userProfile, categories);

    return {
      platform,
      categories: categories.slice(0, 5), // Top 5 categories
      confidence,
      reasoning
    };
  }

  /**
   * Generate predictions for all platforms
   */
  generateAllPredictions(userProfile: UserProfile): { [platform in Platform]: AdPrediction } {
    const predictions = {} as { [platform in Platform]: AdPrediction };
    
    const platforms: Platform[] = ['facebook', 'instagram', 'google', 'youtube', 'tiktok', 'linkedin', 'amazon'];
    
    platforms.forEach(platform => {
      try {
        predictions[platform] = this.generatePredictions(userProfile, platform);
      } catch (error) {
        console.error(`Error generating predictions for ${platform}:`, error);
      }
    });

    return predictions;
  }

  /**
   * Calculate probability scores for each category based on user data
   */
  private calculateCategoryProbabilities(userProfile: UserProfile, platformMapping: PlatformMapping): AdCategory[] {
    const categoryScores = new Map<string, number>();
    
    // Initialize all categories with base scores
    platformMapping.categories.forEach(category => {
      categoryScores.set(category.id, 0.1); // Base probability
    });

    // Score based on interests
    this.scoreByInterests(userProfile.interests, platformMapping, categoryScores);
    
    // Score based on ad preferences
    const platformPreferences = userProfile.adPreferences[platformMapping.name.toLowerCase() as Platform];
    if (platformPreferences) {
      this.scoreByAdPreferences(platformPreferences, platformMapping, categoryScores);
    }
    
    // Score based on app usage
    this.scoreByAppUsage(userProfile.installedApps, platformMapping, categoryScores);
    
    // Score based on search history
    this.scoreBySearchHistory(userProfile.searches, platformMapping, categoryScores);
    
    // Score based on purchase history
    this.scoreByPurchaseHistory(userProfile.purchases, platformMapping, categoryScores);
    
    // Apply prediction rules
    this.applyPredictionRules(userProfile, platformMapping, categoryScores);

    // Convert to AdCategory objects and sort by probability
    const categories: AdCategory[] = platformMapping.categories.map(category => ({
      name: category.name,
      probability: Math.min(categoryScores.get(category.id) || 0, 1.0),
      examples: category.examples
    })).sort((a, b) => b.probability - a.probability);

    return categories;
  }

  /**
   * Score categories based on user interests
   */
  private scoreByInterests(interests: string[], platformMapping: PlatformMapping, categoryScores: Map<string, number>): void {
    interests.forEach(interest => {
      const lowerInterest = interest.toLowerCase();
      
      platformMapping.categories.forEach(category => {
        const matchCount = category.keywords.filter(keyword => 
          lowerInterest.includes(keyword) || keyword.includes(lowerInterest)
        ).length;
        
        if (matchCount > 0) {
          const currentScore = categoryScores.get(category.id) || 0;
          const boost = (matchCount / category.keywords.length) * category.weight * 0.3;
          categoryScores.set(category.id, currentScore + boost);
        }
      });
    });
  }

  /**
   * Score categories based on ad preferences from platforms
   */
  private scoreByAdPreferences(preferences: string[], platformMapping: PlatformMapping, categoryScores: Map<string, number>): void {
    preferences.forEach(preference => {
      const lowerPreference = preference.toLowerCase();
      
      platformMapping.categories.forEach(category => {
        const matchCount = category.keywords.filter(keyword => 
          lowerPreference.includes(keyword) || keyword.includes(lowerPreference)
        ).length;
        
        if (matchCount > 0) {
          const currentScore = categoryScores.get(category.id) || 0;
          const boost = (matchCount / category.keywords.length) * category.weight * 0.4;
          categoryScores.set(category.id, currentScore + boost);
        }
      });
    });
  }

  /**
   * Score categories based on installed app usage
   */
  private scoreByAppUsage(apps: any[], platformMapping: PlatformMapping, categoryScores: Map<string, number>): void {
    apps.forEach(app => {
      const appCategory = app.category?.toLowerCase() || '';
      const appName = app.appName?.toLowerCase() || '';
      
      platformMapping.categories.forEach(category => {
        const keywordMatch = category.keywords.some(keyword => 
          appCategory.includes(keyword) || appName.includes(keyword)
        );
        
        if (keywordMatch) {
          const currentScore = categoryScores.get(category.id) || 0;
          const usageWeight = Math.min(app.usageTime / 60, 5) / 5; // Normalize usage time
          const boost = category.weight * 0.2 * usageWeight;
          categoryScores.set(category.id, currentScore + boost);
        }
      });
    });
  }

  /**
   * Score categories based on search history
   */
  private scoreBySearchHistory(searches: any[], platformMapping: PlatformMapping, categoryScores: Map<string, number>): void {
    searches.forEach(search => {
      const query = search.query?.toLowerCase() || '';
      
      platformMapping.categories.forEach(category => {
        const matchCount = category.keywords.filter(keyword => 
          query.includes(keyword)
        ).length;
        
        if (matchCount > 0) {
          const currentScore = categoryScores.get(category.id) || 0;
          const boost = (matchCount / category.keywords.length) * category.weight * 0.25;
          categoryScores.set(category.id, currentScore + boost);
        }
      });
    });
  }

  /**
   * Score categories based on purchase history
   */
  private scoreByPurchaseHistory(purchases: any[], platformMapping: PlatformMapping, categoryScores: Map<string, number>): void {
    purchases.forEach(purchase => {
      const item = purchase.item?.toLowerCase() || '';
      const purchaseCategory = purchase.category?.toLowerCase() || '';
      
      platformMapping.categories.forEach(category => {
        const keywordMatch = category.keywords.some(keyword => 
          item.includes(keyword) || purchaseCategory.includes(keyword)
        );
        
        if (keywordMatch) {
          const currentScore = categoryScores.get(category.id) || 0;
          const boost = category.weight * 0.35; // Purchases are strong indicators
          categoryScores.set(category.id, currentScore + boost);
        }
      });
    });
  }

  /**
   * Apply platform-specific prediction rules
   */
  private applyPredictionRules(userProfile: UserProfile, platformMapping: PlatformMapping, categoryScores: Map<string, number>): void {
    platformMapping.rules.forEach(rule => {
      let ruleMatches = false;
      
      switch (rule.trigger.type) {
        case 'interest':
          ruleMatches = userProfile.interests.some(interest => 
            rule.trigger.keywords.some(keyword => 
              interest.toLowerCase().includes(keyword)
            )
          );
          break;
        case 'search':
          ruleMatches = userProfile.searches.some(search => 
            rule.trigger.keywords.some(keyword => 
              search.query.toLowerCase().includes(keyword)
            )
          );
          break;
        case 'purchase':
          ruleMatches = userProfile.purchases.some(purchase => 
            rule.trigger.keywords.some(keyword => 
              purchase.item.toLowerCase().includes(keyword)
            )
          );
          break;
        case 'app':
          ruleMatches = userProfile.installedApps.some(app => 
            rule.trigger.keywords.some(keyword => 
              app.category.toLowerCase().includes(keyword) || 
              app.appName.toLowerCase().includes(keyword)
            )
          );
          break;
      }
      
      if (ruleMatches) {
        rule.result.categories.forEach(categoryId => {
          const currentScore = categoryScores.get(categoryId) || 0;
          const boost = rule.result.confidence * 0.3;
          categoryScores.set(categoryId, currentScore + boost);
        });
      }
    });
  }

  /**
   * Generate reasoning for the predictions
   */
  private generateReasoning(userProfile: UserProfile, platformMapping: PlatformMapping, categories: AdCategory[]): string[] {
    const reasoning: string[] = [];
    
    // Data completeness reasoning
    if (userProfile.interests.length > 0) {
      reasoning.push(`Based on ${userProfile.interests.length} stated interests`);
    }
    
    if (userProfile.installedApps.length > 0) {
      reasoning.push(`Analyzed ${userProfile.installedApps.length} installed apps`);
    }
    
    if (userProfile.searches.length > 0) {
      reasoning.push(`Considered ${userProfile.searches.length} search queries`);
    }
    
    if (userProfile.purchases.length > 0) {
      reasoning.push(`Factored in ${userProfile.purchases.length} purchase records`);
    }
    
    // Top category reasoning
    const topCategory = categories[0];
    if (topCategory && topCategory.probability > 0.3) {
      reasoning.push(`High likelihood of ${topCategory.name} ads due to strong profile match`);
    }
    
    // Platform-specific reasoning
    reasoning.push(`Predictions tailored for ${platformMapping.name} advertising algorithms`);
    
    return reasoning;
  }

  /**
   * Calculate overall prediction confidence
   */
  private calculateOverallConfidence(userProfile: UserProfile, categories: AdCategory[]): number {
    let confidence = 0.1; // Base confidence
    
    // Data completeness factors
    if (userProfile.interests.length > 0) confidence += 0.2;
    if (userProfile.installedApps.length > 0) confidence += 0.15;
    if (userProfile.searches.length > 0) confidence += 0.15;
    if (userProfile.purchases.length > 0) confidence += 0.2;
    if (Object.keys(userProfile.adPreferences).length > 0) confidence += 0.15;
    
    // Prediction quality factors
    const topCategoryScore = categories[0]?.probability || 0;
    confidence += topCategoryScore * 0.15;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate example ad templates for a category
   */
  generateAdExamples(platform: Platform, categoryId: string): string[] {
    const platformMapping = this.adMappings.platforms[platform];
    if (!platformMapping) return [];
    
    const category = platformMapping.categories.find(cat => cat.id === categoryId);
    return category ? category.examples : [];
  }

  /**
   * Get platform information
   */
  getPlatformInfo(platform: Platform): PlatformMapping | null {
    return this.adMappings.platforms[platform] || null;
  }

  /**
   * Create a simulated user profile for testing
   */
  createSimulatedProfile(type: 'tech_enthusiast' | 'fashion_lover' | 'fitness_focused' | 'business_professional' = 'tech_enthusiast'): UserProfile {
    const baseProfile: UserProfile = {
      id: `simulated_${type}_${Date.now()}`,
      name: `Simulated ${type.replace('_', ' ')} Profile`,
      interests: [],
      demographics: {},
      adPreferences: {},
      installedApps: [],
      searches: [],
      purchases: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    switch (type) {
      case 'tech_enthusiast':
        baseProfile.interests = ['technology', 'programming', 'gadgets', 'AI', 'smartphones', 'gaming'];
        baseProfile.installedApps = [
          { packageName: 'com.github.android', appName: 'GitHub', usageTime: 120, category: 'productivity' },
          { packageName: 'com.twitter.android', appName: 'Twitter', usageTime: 90, category: 'social' },
          { packageName: 'com.android.chrome', appName: 'Chrome', usageTime: 180, category: 'web' }
        ];
        baseProfile.searches = [
          { query: 'best programming laptop 2024', platform: 'google', timestamp: new Date() },
          { query: 'iPhone 15 pro review', platform: 'youtube', timestamp: new Date() }
        ];
        break;
        
      case 'fashion_lover':
        baseProfile.interests = ['fashion', 'style', 'beauty', 'makeup', 'designer brands', 'trends'];
        baseProfile.installedApps = [
          { packageName: 'com.instagram.android', appName: 'Instagram', usageTime: 150, category: 'social' },
          { packageName: 'com.pinterest', appName: 'Pinterest', usageTime: 75, category: 'lifestyle' }
        ];
        baseProfile.purchases = [
          { item: 'designer handbag', category: 'fashion', platform: 'amazon', timestamp: new Date() },
          { item: 'skincare routine products', category: 'beauty', platform: 'amazon', timestamp: new Date() }
        ];
        break;
        
      case 'fitness_focused':
        baseProfile.interests = ['fitness', 'health', 'nutrition', 'workout', 'wellness', 'sports'];
        baseProfile.installedApps = [
          { packageName: 'com.myfitnesspal.android', appName: 'MyFitnessPal', usageTime: 45, category: 'health' },
          { packageName: 'com.nike.ntc', appName: 'Nike Training', usageTime: 60, category: 'fitness' }
        ];
        break;
        
      case 'business_professional':
        baseProfile.interests = ['business', 'entrepreneurship', 'leadership', 'finance', 'networking'];
        baseProfile.installedApps = [
          { packageName: 'com.linkedin.android', appName: 'LinkedIn', usageTime: 90, category: 'professional' },
          { packageName: 'com.microsoft.office.outlook', appName: 'Outlook', usageTime: 120, category: 'productivity' }
        ];
        break;
    }

    return baseProfile;
  }
}