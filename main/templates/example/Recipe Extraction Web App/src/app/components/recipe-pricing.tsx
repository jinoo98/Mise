import { useState } from 'react';
import { Calculator, Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  price: number;
}

const presetRecipes = [
  {
    name: '김치찌개',
    ingredients: [
      { name: '묵은지', amount: '1/4포기', price: 3000 },
      { name: '돼지고기', amount: '200g', price: 4000 },
      { name: '두부', amount: '1/2모', price: 1500 },
      { name: '대파', amount: '1대', price: 500 },
      { name: '양파', amount: '1/2개', price: 300 },
    ],
    servings: 2,
  },
  {
    name: '간장계란밥',
    ingredients: [
      { name: '밥', amount: '1공기', price: 500 },
      { name: '계란', amount: '2개', price: 600 },
      { name: '간장', amount: '2큰술', price: 200 },
      { name: '참기름', amount: '1큰술', price: 400 },
      { name: '김', amount: '적당량', price: 800 },
    ],
    servings: 1,
  },
  {
    name: '크림 파스타',
    ingredients: [
      { name: '스파게티 면', amount: '200g', price: 2000 },
      { name: '베이컨', amount: '100g', price: 3000 },
      { name: '생크림', amount: '200ml', price: 2500 },
      { name: '파마산 치즈', amount: '50g', price: 3500 },
      { name: '마늘', amount: '3쪽', price: 300 },
    ],
    servings: 2,
  },
];

export function RecipePricing() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [servings, setServings] = useState(2);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    amount: '',
    price: '',
  });

  const loadPreset = (recipeName: string) => {
    const recipe = presetRecipes.find((r) => r.name === recipeName);
    if (recipe) {
      const loadedIngredients = recipe.ingredients.map((ing, index) => ({
        id: `${Date.now()}-${index}`,
        ...ing,
      }));
      setIngredients(loadedIngredients);
      setServings(recipe.servings);
    }
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount && newIngredient.price) {
      setIngredients([
        ...ingredients,
        {
          id: Date.now().toString(),
          name: newIngredient.name,
          amount: newIngredient.amount,
          price: Number(newIngredient.price),
        },
      ]);
      setNewIngredient({ name: '', amount: '', price: '' });
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const updateIngredientPrice = (id: string, price: number) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, price } : ing
      )
    );
  };

  const totalCost = ingredients.reduce((sum, ing) => sum + ing.price, 0);
  const costPerServing = servings > 0 ? totalCost / servings : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 입력 섹션 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 프리셋 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>레시피 선택</CardTitle>
            <CardDescription>
              미리 준비된 레시피를 선택하거나 직접 재료를 추가하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={loadPreset}>
              <SelectTrigger>
                <SelectValue placeholder="레시피를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {presetRecipes.map((recipe) => (
                  <SelectItem key={recipe.name} value={recipe.name}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* 재료 추가 */}
        <Card>
          <CardHeader>
            <CardTitle>재료 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Label htmlFor="ingredient-name">재료명</Label>
                <Input
                  id="ingredient-name"
                  placeholder="예: 돼지고기"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="ingredient-amount">수량</Label>
                <Input
                  id="ingredient-amount"
                  placeholder="예: 200g"
                  value={newIngredient.amount}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="ingredient-price">가격 (원)</Label>
                <div className="flex gap-2">
                  <Input
                    id="ingredient-price"
                    type="number"
                    placeholder="3000"
                    value={newIngredient.price}
                    onChange={(e) =>
                      setNewIngredient({ ...newIngredient, price: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  />
                </div>
              </div>
            </div>
            <Button onClick={addIngredient} className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              재료 추가
            </Button>
          </CardContent>
        </Card>

        {/* 재료 목록 */}
        {ingredients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>재료 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{ingredient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {ingredient.amount}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={ingredient.price}
                        onChange={(e) =>
                          updateIngredientPrice(ingredient.id, Number(e.target.value))
                        }
                        className="w-24 text-right"
                      />
                      <span className="text-sm text-muted-foreground">원</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(ingredient.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 계산 결과 */}
      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              단가 계산
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 인분 설정 */}
            <div>
              <Label htmlFor="servings">인분</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="h-px bg-border" />

            {/* 총 비용 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">총 재료비</span>
                <span className="text-lg">
                  {totalCost.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-lg">
                <div>
                  <div className="text-sm opacity-90">1인분 가격</div>
                  <div className="text-2xl font-bold">
                    {costPerServing.toLocaleString()}원
                  </div>
                </div>
                <DollarSign className="w-8 h-8 opacity-50" />
              </div>

              {/* 비용 분석 */}
              {ingredients.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-sm font-medium">재료별 비중</div>
                  {ingredients
                    .sort((a, b) => b.price - a.price)
                    .slice(0, 3)
                    .map((ing) => {
                      const percentage = ((ing.price / totalCost) * 100).toFixed(1);
                      return (
                        <div key={ing.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{ing.name}</span>
                            <span className="text-muted-foreground">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 가격 분석 카드 */}
        {ingredients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                비용 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">재료 개수</span>
                <Badge variant="secondary">{ingredients.length}개</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">평균 재료비</span>
                <Badge variant="secondary">
                  {(totalCost / ingredients.length).toLocaleString()}원
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">가장 비싼 재료</span>
                <Badge variant="outline" className="border-primary text-primary">
                  {ingredients.reduce((max, ing) =>
                    ing.price > max.price ? ing : max
                  ).name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 초기 상태 안내 */}
        {ingredients.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calculator className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                레시피를 선택하거나
                <br />
                재료를 추가해보세요
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
