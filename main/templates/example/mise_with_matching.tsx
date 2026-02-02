<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise - Recipe Extraction Web App</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Custom Theme Variables -->
    <style>
        :root {
            --background: #FAFBFC;
            --foreground: #0f172a;
            --card: #ffffff;
            --card-foreground: #0f172a;
            --popover: #ffffff;
            --popover-foreground: #0f172a;
            --primary: #DC2626;
            --primary-foreground: #ffffff;
            --secondary: #FEF2F2;
            --secondary-foreground: #991B1B;
            --muted: #f1f5f9;
            --muted-foreground: #64748b;
            --accent: #f1f5f9;
            --accent-foreground: #0f172a;
            --destructive: #ef4444;
            --destructive-foreground: #f8fafc;
            --border: #e2e8f0;
            --input: #e2e8f0;
            --ring: #DC2626;
            --radius: 0.5rem;
        }

        body {
            background-color: #FAFBFC;
            background-image: linear-gradient(to bottom right, #FAFBFC, #FAFBFC);
            color: var(--foreground);
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .card {
            background-color: var(--card);
            color: var(--card-foreground);
            border-radius: var(--radius);
            border: 1px solid var(--border);
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }

        .btn-primary {
            background-color: var(--primary);
            color: var(--primary-foreground);
        }

        .btn-primary:hover {
            opacity: 0.9;
        }

        .tab-active {
            background-color: var(--background);
            color: var(--foreground);
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .tab-inactive {
            color: var(--muted-foreground);
        }

        .tab-inactive:hover {
            color: var(--foreground);
        }

        .ingredient-tag {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }

        .ingredient-tag.user {
            background-color: #DBEAFE;
            color: #1E40AF;
            border: 1px solid #93C5FD;
        }

        .ingredient-tag.matched {
            background-color: #D1FAE5;
            color: #065F46;
            border: 1px solid #6EE7B7;
        }

        .ingredient-tag.missing {
            background-color: #FEE2E2;
            color: #991B1B;
            border: 1px solid #FCA5A5;
        }

        .ingredient-tag button {
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        .ingredient-tag button:hover {
            opacity: 1;
        }
    </style>
</head>

<body class="min-h-screen">

    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 shadow-none">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 shadow-none">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white">
                    <i data-lucide="chef-hat" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-red-600">Mise</h1>
                    <p class="text-xs text-gray-500">Mise En Place - 요리의 준비를 위한 모든 것</p>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 shadow-none">

        <!-- Tabs -->
        <div class="w-full mb-8 shadow-none">
            <div class="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg mb-6 shadow-none ">
                <button onclick="switchTab('extractor')" id="tab-extractor"
                    class="tab-active flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all h-20">
                    <i data-lucide="chef-hat" class="w-4 h-4"></i>
                    <span>레시피 추출</span>
                </button>
                <button onclick="switchTab('pricing')" id="tab-pricing"
                    class="tab-inactive flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all">
                    <i data-lucide="calculator" class="w-4 h-4"></i>
                    <span>단가 계산</span>
                </button>
                <button onclick="switchTab('match')" id="tab-match"
                    class="tab-inactive flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all">
                    <i data-lucide="cooking-pot" class="w-4 h-4"></i>
                    <span>재료 매칭</span>
                </button>
            </div>

            <!-- Tab Content: Extractor -->
            <div id="content-extractor" class="space-y-6">

                <!-- Search Section -->
                <div class="card p-6 shadow-none">
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold flex items-center gap-2 mb-1">
                            <i data-lucide="youtube" class="w-5 h-5 text-red-600"></i>
                            유튜브 레시피 검색
                        </h2>
                        <p class="text-sm text-gray-500">유튜브 채널명이나 요리명을 입력하세요</p>
                    </div>

                    <form method="POST" class="flex flex-col gap-3" action="#">
                        <div class="flex gap-4 mb-1">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="search_type" value="channel"
                                    class="text-red-600 focus:ring-red-500" checked>
                                <span class="text-sm font-medium text-gray-700">채널 검색</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="search_type" value="keyword"
                                    class="text-red-600 focus:ring-red-500">
                                <span class="text-sm font-medium text-gray-700">요리명 검색</span>
                            </label>
                        </div>
                        <div class="flex gap-2">
                            <input type="text" name="search_query" id="youtube-input"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="유튜버 이름이나 요리명을 입력하세요..." required>
                            <button type="submit"
                                class="btn-primary px-4 py-2 rounded-md flex items-center gap-2 font-medium">
                                <i data-lucide="search" class="w-4 h-4"></i>
                                검색
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Placeholder for Recent Recipes -->
                <div class="card border-dashed p-12 flex flex-col items-center justify-center text-center">
                    <i data-lucide="youtube" class="w-16 h-16 text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-1">레시피를 추출해보세요</h3>
                    <p class="text-sm text-gray-500">
                        상단의 검색창에 요리명이나 채널명을 입력하여<br>첫 번째 레시피를 만들어보세요.
                    </p>
                </div>
            </div>

            <!-- Tab Content: Pricing (Placeholder) -->
            <div id="content-pricing" class="hidden card p-12 text-center">
                <i data-lucide="calculator" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900">준비 중입니다</h3>
                <p class="text-sm text-gray-500">단가 계산 기능은 곧 제공될 예정입니다.</p>
            </div>

            <!-- Tab Content: Match -->
            <div id="content-match" class="hidden space-y-6">
                
                <!-- Available Ingredients Input -->
                <div class="card p-6">
                    <div class="mb-6">
                        <h2 class="text-xl font-semibold flex items-center gap-2 mb-1">
                            <i data-lucide="package" class="w-5 h-5 text-red-600"></i>
                            보유 재료 입력
                        </h2>
                        <p class="text-sm text-gray-500">현재 가지고 있는 재료를 입력하면 만들 수 있는 레시피를 추천해드립니다</p>
                    </div>

                    <div class="space-y-4">
                        <div class="flex gap-2">
                            <input type="text" id="ingredient-input" 
                                placeholder="재료명 입력 후 Enter 또는 추가 버튼 클릭"
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            <button type="button" onclick="addIngredient()" 
                                class="btn-primary px-6 py-2 rounded-lg flex items-center gap-2 font-medium">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                                추가
                            </button>
                        </div>

                        <!-- Quick Add Buttons -->
                        <div class="flex flex-wrap gap-2">
                            <span class="text-xs text-gray-500 w-full mb-1">자주 쓰는 재료:</span>
                            <button type="button" onclick="quickAddIngredient('돼지고기')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                돼지고기
                            </button>
                            <button type="button" onclick="quickAddIngredient('소고기')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                소고기
                            </button>
                            <button type="button" onclick="quickAddIngredient('닭고기')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                닭고기
                            </button>
                            <button type="button" onclick="quickAddIngredient('양파')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                양파
                            </button>
                            <button type="button" onclick="quickAddIngredient('마늘')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                마늘
                            </button>
                            <button type="button" onclick="quickAddIngredient('대파')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                대파
                            </button>
                            <button type="button" onclick="quickAddIngredient('간장')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                간장
                            </button>
                            <button type="button" onclick="quickAddIngredient('고추장')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                고추장
                            </button>
                            <button type="button" onclick="quickAddIngredient('된장')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                된장
                            </button>
                            <button type="button" onclick="quickAddIngredient('두부')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                두부
                            </button>
                            <button type="button" onclick="quickAddIngredient('김치')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                김치
                            </button>
                            <button type="button" onclick="quickAddIngredient('계란')" 
                                class="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                계란
                            </button>
                        </div>

                        <div id="user-ingredients-container" class="flex flex-wrap gap-2 min-h-[100px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div class="w-full text-center text-sm text-gray-400 py-6" id="empty-ingredients-message">
                                <i data-lucide="info" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                                <p>재료를 입력하면 자동으로 레시피를 추천해드립니다</p>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button type="button" onclick="findRecipes()" 
                                class="flex-1 btn-primary py-3 rounded-lg text-base font-semibold flex items-center justify-center gap-2">
                                <i data-lucide="search" class="w-5 h-5"></i>
                                레시피 찾기
                            </button>
                            <button type="button" onclick="clearIngredients()" 
                                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-base font-semibold hover:bg-gray-300 transition-colors">
                                초기화
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Recipe Recommendations -->
                <div id="recipe-recommendations" class="hidden space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <i data-lucide="chef-hat" class="w-5 h-5 text-red-600"></i>
                            추천 레시피
                        </h3>
                        <span id="recommendation-count" class="text-sm text-gray-500"></span>
                    </div>

                    <div id="recipe-cards-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Recipe cards will be dynamically inserted here -->
                    </div>
                </div>

                <!-- No Recommendations Message -->
                <div id="no-recommendations" class="hidden card p-12 text-center">
                    <i data-lucide="search-x" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">추천할 레시피가 없습니다</h3>
                    <p class="text-sm text-gray-500 mb-4">
                        더 많은 재료를 추가하면<br>다양한 레시피를 추천받을 수 있습니다.
                    </p>
                    <button onclick="document.getElementById('ingredient-input').focus()" 
                        class="btn-primary px-6 py-2 rounded-lg inline-flex items-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        재료 추가하기
                    </button>
                </div>

            </div>

        </div>
    </main>

    <script>
        // Initialize Lucide Icons
        lucide.createIcons();

        // State Management
        let userIngredients = [];

        // Recipe Database
        const recipeDatabase = [
            {
                id: 1,
                title: "김치찌개",
                youtuber: "백종원",
                difficulty: "쉬움",
                time: "30분",
                ingredients: ["김치", "돼지고기", "두부", "대파", "양파", "고춧가루", "된장", "마늘"],
                description: "한국인의 소울푸드, 얼큰하고 시원한 김치찌개"
            },
            {
                id: 2,
                title: "제육볶음",
                youtuber: "1분요리 뚝딱이형",
                difficulty: "보통",
                time: "25분",
                ingredients: ["돼지고기", "고춧가루", "고추장", "간장", "설탕", "마늘", "생강", "양파", "대파"],
                description: "매콤달콤한 맛이 일품인 제육볶음"
            },
            {
                id: 3,
                title: "된장찌개",
                youtuber: "성시경",
                difficulty: "쉬움",
                time: "20분",
                ingredients: ["된장", "두부", "감자", "호박", "양파", "대파", "청양고추"],
                description: "구수하고 건강한 한식의 기본, 된장찌개"
            },
            {
                id: 4,
                title: "계란말이",
                youtuber: "하루한끼",
                difficulty: "쉬움",
                time: "10분",
                ingredients: ["계란", "대파", "당근", "소금", "설탕"],
                description: "부드럽고 고소한 계란말이"
            },
            {
                id: 5,
                title: "김치볶음밥",
                youtuber: "백종원",
                difficulty: "쉬움",
                time: "15분",
                ingredients: ["김치", "밥", "계란", "대파", "참기름", "김"],
                description: "간단하고 맛있는 김치볶음밥"
            },
            {
                id: 6,
                title: "된장국",
                youtuber: "성시경",
                difficulty: "쉬움",
                time: "15분",
                ingredients: ["된장", "두부", "양파", "대파", "마늘"],
                description: "깔끔하고 시원한 된장국"
            },
            {
                id: 7,
                title: "불고기",
                youtuber: "수랏간 정셰프",
                difficulty: "보통",
                time: "40분",
                ingredients: ["소고기", "간장", "설탕", "마늘", "배", "양파", "대파", "참기름"],
                description: "달콤하고 부드러운 한국식 불고기"
            },
            {
                id: 8,
                title: "닭볶음탕",
                youtuber: "1분요리 뚝딱이형",
                difficulty: "보통",
                time: "45분",
                ingredients: ["닭고기", "감자", "양파", "대파", "고춧가루", "고추장", "간장", "마늘", "생강"],
                description: "매콤하고 푸짐한 닭볶음탕"
            },
            {
                id: 9,
                title: "순두부찌개",
                youtuber: "집나간 아들",
                difficulty: "쉬움",
                time: "20분",
                ingredients: ["순두부", "계란", "대파", "고춧가루", "마늘", "간장"],
                description: "부드럽고 얼큰한 순두부찌개"
            },
            {
                id: 10,
                title: "비빔밥",
                youtuber: "백종원",
                difficulty: "보통",
                time: "35분",
                ingredients: ["밥", "계란", "소고기", "당근", "시금치", "콩나물", "고추장", "참기름", "김"],
                description: "건강하고 맛있는 비빔밥"
            }
        ];

        // Tab Switching Logic
        function switchTab(tabName) {
            ['extractor', 'pricing', 'match'].forEach(name => {
                document.getElementById(`content-${name}`).classList.add('hidden');

                const btn = document.getElementById(`tab-${name}`);
                if (name === tabName) {
                    btn.classList.remove('tab-inactive');
                    btn.classList.add('tab-active');
                    btn.classList.add('bg-white', 'shadow-sm');
                } else {
                    btn.classList.remove('tab-active', 'bg-white', 'shadow-sm');
                    btn.classList.add('tab-inactive');
                }
            });

            document.getElementById(`content-${tabName}`).classList.remove('hidden');
            
            // Reinitialize icons after tab switch
            setTimeout(() => lucide.createIcons(), 0);
        }

        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', function() {
            // Enter key handler
            const ingredientInput = document.getElementById('ingredient-input');
            if (ingredientInput) {
                ingredientInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addIngredient();
                    }
                });
            }
        });

        // Add Ingredient
        function addIngredient() {
            const input = document.getElementById('ingredient-input');
            if (!input) {
                console.error('ingredient-input not found');
                return;
            }
            
            const ingredient = input.value.trim();
            
            if (ingredient && !userIngredients.includes(ingredient)) {
                userIngredients.push(ingredient);
                renderUserIngredients();
                input.value = '';
                console.log('Added ingredient:', ingredient, 'Total:', userIngredients);
            } else if (ingredient) {
                alert('이미 추가된 재료입니다.');
            } else {
                alert('재료명을 입력해주세요.');
            }
        }

        // Quick Add Ingredient
        function quickAddIngredient(ingredient) {
            if (!userIngredients.includes(ingredient)) {
                userIngredients.push(ingredient);
                renderUserIngredients();
                console.log('Quick added ingredient:', ingredient);
            } else {
                alert('이미 추가된 재료입니다.');
            }
        }

        // Remove Ingredient
        function removeIngredient(ingredient) {
            userIngredients = userIngredients.filter(i => i !== ingredient);
            renderUserIngredients();
            
            // Hide recommendations if no ingredients
            if (userIngredients.length === 0) {
                document.getElementById('recipe-recommendations').classList.add('hidden');
                document.getElementById('no-recommendations').classList.add('hidden');
            }
        }

        // Clear All Ingredients
        function clearIngredients() {
            if (userIngredients.length === 0) {
                alert('추가된 재료가 없습니다.');
                return;
            }
            
            if (confirm('모든 재료를 삭제하시겠습니까?')) {
                userIngredients = [];
                renderUserIngredients();
                document.getElementById('recipe-recommendations').classList.add('hidden');
                document.getElementById('no-recommendations').classList.add('hidden');
            }
        }

        // Render User Ingredients
        function renderUserIngredients() {
            const container = document.getElementById('user-ingredients-container');
            
            if (userIngredients.length === 0) {
                container.innerHTML = `
                    <div class="w-full text-center text-sm text-gray-400 py-6" id="empty-ingredients-message">
                        <i data-lucide="info" class="w-8 h-8 text-gray-300 mx-auto mb-2"></i>
                        <p>재료를 입력하면 자동으로 레시피를 추천해드립니다</p>
                    </div>
                `;
                lucide.createIcons();
            } else {
                container.innerHTML = userIngredients.map(ingredient => `
                    <div class="ingredient-tag user">
                        <span>${ingredient}</span>
                        <button onclick="removeIngredient('${ingredient}')" type="button">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                `).join('');
                lucide.createIcons();
            }
        }

        // Find Recipes based on ingredients
        function findRecipes() {
            if (userIngredients.length === 0) {
                alert('재료를 먼저 입력해주세요!');
                return;
            }

            // Calculate match percentage for each recipe
            const recommendations = recipeDatabase.map(recipe => {
                const matchedIngredients = recipe.ingredients.filter(ing => 
                    userIngredients.some(userIng => 
                        userIng.includes(ing) || ing.includes(userIng) || 
                        userIng.toLowerCase().includes(ing.toLowerCase()) || 
                        ing.toLowerCase().includes(userIng.toLowerCase())
                    )
                );
                
                const missingIngredients = recipe.ingredients.filter(ing => !matchedIngredients.includes(ing));
                const matchPercentage = Math.round((matchedIngredients.length / recipe.ingredients.length) * 100);
                
                return {
                    ...recipe,
                    matchedIngredients,
                    missingIngredients,
                    matchPercentage,
                    matchedCount: matchedIngredients.length,
                    missingCount: missingIngredients.length
                };
            });

            // Sort by match percentage (highest first)
            recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

            // Filter recipes with at least 30% match
            const validRecommendations = recommendations.filter(r => r.matchPercentage >= 30);

            if (validRecommendations.length === 0) {
                document.getElementById('recipe-recommendations').classList.add('hidden');
                document.getElementById('no-recommendations').classList.remove('hidden');
                lucide.createIcons();
            } else {
                document.getElementById('no-recommendations').classList.add('hidden');
                document.getElementById('recipe-recommendations').classList.remove('hidden');
                document.getElementById('recommendation-count').textContent = 
                    `${validRecommendations.length}개의 레시피를 찾았습니다`;
                
                renderRecipeCards(validRecommendations);
            }

            // Smooth scroll to results
            setTimeout(() => {
                const target = validRecommendations.length > 0 
                    ? document.getElementById('recipe-recommendations')
                    : document.getElementById('no-recommendations');
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // Render Recipe Cards
        function renderRecipeCards(recipes) {
            const container = document.getElementById('recipe-cards-container');
            
            container.innerHTML = recipes.map(recipe => `
                <div class="card p-5 hover:shadow-lg transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-gray-900 mb-1">${recipe.title}</h3>
                            <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <i data-lucide="youtube" class="w-3 h-3"></i>
                                <span>${recipe.youtuber}</span>
                            </div>
                        </div>
                    </div>

                    <p class="text-sm text-gray-600 mb-4">${recipe.description}</p>

                    <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span class="flex items-center gap-1">
                            <i data-lucide="clock" class="w-3 h-3"></i>
                            ${recipe.time}
                        </span>
                        <span class="flex items-center gap-1">
                            <i data-lucide="bar-chart" class="w-3 h-3"></i>
                            ${recipe.difficulty}
                        </span>
                    </div>

                    <!-- Match Stats -->
                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="bg-green-50 border border-green-200 rounded px-3 py-2 text-center">
                            <div class="text-lg font-bold text-green-700">${recipe.matchedCount}</div>
                            <div class="text-xs text-green-600">보유 재료</div>
                        </div>
                        <div class="bg-red-50 border border-red-200 rounded px-3 py-2 text-center">
                            <div class="text-lg font-bold text-red-700">${recipe.missingCount}</div>
                            <div class="text-xs text-red-600">필요 재료</div>
                        </div>
                    </div>

                    <!-- Matched Ingredients -->
                    ${recipe.matchedIngredients.length > 0 ? `
                    <div class="mb-3">
                        <div class="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <i data-lucide="check" class="w-3 h-3 text-green-600"></i>
                            보유 중
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${recipe.matchedIngredients.map(ing => `
                                <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">${ing}</span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Missing Ingredients -->
                    ${recipe.missingIngredients.length > 0 ? `
                    <div class="mb-4">
                        <div class="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <i data-lucide="shopping-cart" class="w-3 h-3 text-red-600"></i>
                            구매 필요
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${recipe.missingIngredients.map(ing => `
                                <span class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">${ing}</span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Action Button -->
                    <button onclick="alert('레시피 상세보기 기능은 준비 중입니다!')" 
                        class="w-full py-2 rounded-lg font-medium text-sm transition-colors
                               ${recipe.matchPercentage === 100 
                                   ? 'bg-green-600 text-white hover:bg-green-700' 
                                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                               flex items-center justify-center gap-2">
                        <i data-lucide="${recipe.matchPercentage === 100 ? 'chef-hat' : 'arrow-right'}" class="w-4 h-4"></i>
                        ${recipe.matchPercentage === 100 ? '바로 만들기' : '레시피 보기'}
                    </button>
                </div>
            `).join('');

            lucide.createIcons();
        }

        // Placeholder animation
        const examples = [
            "백종원 PAIK JONG WON", "스팸마요덮밥",
            "1분요리 뚝딱이형", "제육볶음",
            "성시경 SUNG SI KYUNG", "된장찌개",
            "육식맨 YOOXICMAN", "스테이크",
            "쿠킹트리 Cooking tree", "초코 케이크",
            "승우아빠", "마라탕",
            "하루한끼", "계란말이",
            "표정원 Pyojungwon", "알리오올리오",
            "수랏간 정셰프", "갈비찜",
            "조승연의 탐구생활(요리편)", "라따뚜이",
            "집나간 아들", "순두부찌개",
            "취요남", "통삼겹 오븐구이"
        ];
        let i = 0;
        const input = document.getElementById('youtube-input');

        setInterval(() => {
            input.placeholder = `예: ${examples[i++ % examples.length]}...`;
        }, 2000);
    </script>
</body>

</html>
