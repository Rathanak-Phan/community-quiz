<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $submission->quiz->title }} - Results</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ $submission->is_anonymous ? 'Someone' : ($submission->user?->name ?? 'Unknown User') }} just scored {{ $submission->score }}/{{ $submission->max_score }}!">
    <meta property="og:description" content="Check out the results for the '{{ $submission->quiz->title }}' quiz on Community Quiz platform.">
    <meta property="og:image" content="{{ $submission->quiz->cover_image ? asset('storage/' . $submission->quiz->cover_image) : asset('favicon.ico') }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title" content="{{ $submission->is_anonymous ? 'Someone' : ($submission->user?->name ?? 'Unknown User') }} just scored {{ $submission->score }}/{{ $submission->max_score }}!">
    <meta property="twitter:description" content="Check out the results for the '{{ $submission->quiz->title }}' quiz on Community Quiz platform.">

    <!-- Auto-redirect to Frontend for real users -->
    <script>
        setTimeout(function() {
            window.location.href = "{{ $frontend_url }}";
        }, 1000);
    </script>

    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f7f6; margin: 0; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
        .score { font-size: 3rem; font-weight: bold; color: #2563eb; margin: 1rem 0; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Quiz Result</h2>
        <p>{{ $submission->is_anonymous ? 'Anonymous User' : ($submission->user?->name ?? 'Unknown User') }} completed</p>
        <div class="quiz-title"><strong>{{ $submission->quiz->title }}</strong></div>
        <div class="score">{{ $submission->score }} / {{ $submission->max_score }}</div>
        <p>Redirecting you to the results page...</p>
        <a href="{{ $frontend_url }}" class="btn">View Full Results</a>
    </div>
</body>
</html>

