<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiRequest
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ensure the request has proper content type for POST/PUT/PATCH requests
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $contentType = $request->header('Content-Type');
            
            // If no content type is set, set it to application/json
            if (!$contentType || !str_contains($contentType, 'application/json')) {
                $request->headers->set('Content-Type', 'application/json');
            }
        }

        return $next($request);
    }
}