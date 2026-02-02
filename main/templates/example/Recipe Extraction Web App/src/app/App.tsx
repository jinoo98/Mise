import { useState } from 'react';
import { ChefHat, Calculator, CookingPot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { RecipeExtractor } from '@/app/components/recipe-extractor';
import { RecipePricing } from '@/app/components/recipe-pricing';
import { IngredientMatch } from '@/app/components/ingredient-match';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Mise</h1>
              <p className="text-sm text-muted-foreground">Mise En Place - 요리의 모든 것</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="extractor" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="extractor" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">레시피 추출</span>
              <span className="sm:hidden">추출</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">단가 계산</span>
              <span className="sm:hidden">단가</span>
            </TabsTrigger>
            <TabsTrigger value="match" className="flex items-center gap-2">
              <CookingPot className="w-4 h-4" />
              <span className="hidden sm:inline">재료 매칭</span>
              <span className="sm:hidden">매칭</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extractor">
            <RecipeExtractor />
          </TabsContent>

          <TabsContent value="pricing">
            <RecipePricing />
          </TabsContent>

          <TabsContent value="match">
            <IngredientMatch />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
