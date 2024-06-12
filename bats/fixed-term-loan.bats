#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

wait_for_interest() {
  variables=$(
    jq -n \
    --arg loanId "$1" \
    '{ id: $loanId }'
  )
  exec_graphql 'find-loan' "$variables"
  outstanding_balance=$(graphql_output '.data.loan.balance.outstanding.usdBalance')
  cache_value 'outstanding' "$outstanding_balance"
  interest_balance=$(graphql_output '.data.loan.balance.interestIncurred.usdBalance')
  cache_value 'interest_incurred' "$interest_balance"
  [[ "$interest_balance" == "2" ]] || return 1
}

@test "fixed-term-loan: loan lifecycle" {
  username=$(random_uuid)
  variables=$(
    jq -n \
      --arg username "$username" \
    '{
      input: {
        bitfinexUsername: $username,
      }
    }'
  )
  exec_graphql 'user-create' "$variables"
  user_id=$(graphql_output '.data.userCreate.user.userId')
  btc_address=$(graphql_output '.data.userCreate.user.btcDepositAddress')
  ust_address=$(graphql_output '.data.userCreate.user.ustDepositAddress')

  variables=$(
    jq -n \
      --arg address "$btc_address" \
    '{
       address: $address,
       amount: "10",
       currency: "BTC"
    }'
  )
  exec_cala_graphql 'simulate-deposit' "$variables"

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
      }
    }'
  )
  exec_graphql 'fixed-term-loan-create' "$variables"
  id=$(graphql_output '.data.fixedTermLoanCreate.loan.loanId')
  [[ "$id" != null ]] || exit 1;
  collateral_balance=$(graphql_output '.data.fixedTermLoanCreate.loan.balance.collateral.btcBalance')
  [[ "$collateral_balance" == "0" ]] || exit 1;
  principal_balance=$(graphql_output '.data.fixedTermLoanCreate.loan.balance.outstanding.usdBalance')
  [[ "$principal_balance" == "0" ]] || exit 1;

  variables=$(
    jq -n \
      --arg loanId "$id" \
    '{
      input: {
        loanId: $loanId,
        collateral: 400000000,
        principal: 25000000,
      }
    }'
  )
  exec_graphql 'approve-loan' "$variables"
  loan_id=$(graphql_output '.data.fixedTermLoanApprove.loan.loanId')
  [[ "$id" == "$loan_id" ]] || exit 1;
  collateral_balance=$(graphql_output '.data.fixedTermLoanApprove.loan.balance.collateral.btcBalance')
  [[ "$collateral_balance" == "400000000" ]] || exit 1;
  principal_balance=$(graphql_output '.data.fixedTermLoanApprove.loan.balance.outstanding.usdBalance')
  [[ "$principal_balance" == "25000000" ]] || exit 1;

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  usd_balance=$(graphql_output '.data.user.balance.checking.settled.usdBalance')
  [[ "$usd_balance" == 25000000 ]] || exit 1
  btc_balance=$(graphql_output '.data.user.balance.unallocatedCollateral.settled.btcBalance')
  [[ "$btc_balance" == 600000000 ]] || exit 1

  retry 30 1 wait_for_interest "$id"
  interest_balance=$(read_value 'interest_incurred')
  [[ "$interest_balance" == "2" ]] || exit 1

  outstanding_before=$(read_value 'outstanding')
  variables=$(
    jq -n \
      --arg loanId "$id" \
    '{
      input: {
        loanId: $loanId,
        amount: 1,
      }
    }'
  )
  exec_graphql 'record-payment' "$variables"
  outstanding_after=$(graphql_output '.data.fixedTermLoanRecordPayment.loan.balance.outstanding.usdBalance')
  [[ "$outstanding_after" -gt "0" ]] || exit 1
  [[ "$outstanding_after" -lt "$outstanding_before" ]] || exit 1

  variables=$(
    jq -n \
      --arg address "$ust_address" \
    '{
       address: $address,
       amount: "25000000",
       currency: "UST"
    }'
  )
  exec_cala_graphql 'simulate-deposit' "$variables"

  variables=$(
    jq -n \
      --arg loanId "$id" \
    '{
      input: {
        loanId: $loanId,
        amount: 25000001,
      }
    }'
  )
  exec_graphql 'record-payment' "$variables"
  outstanding=$(graphql_output '.data.fixedTermLoanRecordPayment.loan.balance.outstanding.usdBalance')
  [[ "$outstanding" == "0" ]] || exit 1

  variables=$(
    jq -n \
    --arg loanId "$id" \
    '{ id: $loanId }'
  )
  exec_graphql 'find-loan' "$variables"
  collateral_balance=$(graphql_output '.data.loan.balance.collateral.btcBalance')
  [[ "$collateral_balance" == "0" ]] || exit 1

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  btc_balance=$(graphql_output '.data.user.balance.unallocatedCollateral.settled.btcBalance')
  echo $(graphql_output)
  [[ "$btc_balance" == 1000000000 ]] || exit 1
}
