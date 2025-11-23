<script lang="ts">
    import type { Quiz, Technique } from "$lib/server/db/schema";
    import QuizBadges from "./QuizBadges.svelte";
    import QuizProgressInfo from "./QuizProgressInfo.svelte";

    interface QuizCardProps {
        quiz: Quiz;
        technique: Technique | null;
        attemptCount: number;
        bestScore: number | null;
        isCompleted: boolean | null;
    }

    let {
        quiz,
        technique,
        attemptCount,
        bestScore,
        isCompleted,
    }: QuizCardProps = $props();
</script>

<a
    href={`/quizzes/${quiz.id}`}
    class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
>
    <div class="card-body">
        <h3 class="card-title text-lg">{quiz.title}</h3>
        <p class="text-sm text-gray-600">
            {quiz.description}
        </p>

        <QuizBadges {attemptCount} {isCompleted} {quiz} {technique} />
        <QuizProgressInfo {attemptCount} {bestScore} />
    </div>
</a>
