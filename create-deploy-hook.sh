#!/bin/bash
# Create Vercel Deploy Hook for Convex Production

PROJECT_ID="prj_OJl53cWtHNVniPobmrz8apwe7UCl"

echo "Creating Vercel Deploy Hook..."
echo ""
echo "Please provide your Vercel token:"
echo "Get it from: https://vercel.com/account/tokens"
echo ""
read -p "Vercel Token: " VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

RESPONSE=$(curl -s -X POST "https://api.vercel.com/v1/projects/${PROJECT_ID}/deploy-hooks" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Convex Production Deploy",
    "ref": "main"
  }')

HOOK_URL=$(echo $RESPONSE | jq -r '.url // empty')
ERROR=$(echo $RESPONSE | jq -r '.error.message // empty')

if [ -n "$HOOK_URL" ]; then
  echo ""
  echo "✅ Deploy Hook Created Successfully!"
  echo ""
  echo "Hook URL:"
  echo "$HOOK_URL"
  echo ""
  echo "To trigger deployments from Convex or CI/CD, use:"
  echo "curl -X POST \"$HOOK_URL\""
  echo ""
  echo "💾 Save this URL - you'll need it to configure Convex auto-deploy"
else
  echo ""
  echo "❌ Failed to create hook:"
  echo "$ERROR"
  echo ""
  echo "Full response:"
  echo "$RESPONSE" | jq '.'
fi
